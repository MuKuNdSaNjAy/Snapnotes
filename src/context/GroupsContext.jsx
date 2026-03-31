import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import emailjs from "@emailjs/browser";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

emailjs.init({ publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY });

export const GroupsContext = createContext(null);

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function localGet(key, def = "[]") { try { return JSON.parse(localStorage.getItem(key) || def); } catch { return JSON.parse(def); } }
function localSave(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

const LS_GROUPS   = "snapnotes_groups";
const LS_MEMBERS  = "snapnotes_gmembers";
const LS_INVITES  = "snapnotes_invites";

export function GroupsProvider({ children }) {
  const { user } = useAuth();

  const [myGroups,      setMyGroups]      = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupMembers,  setGroupMembers]  = useState({});
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [pendingInvites, setPendingInvites] = useState([]);

  // ── Load my groups ─────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);

    if (!supabase) {
      const allGroups  = localGet(LS_GROUPS);
      const allMembers = localGet(LS_MEMBERS);
      const mine = allGroups
        .filter(g => allMembers.some(m => m.group_id === g.id && m.user_id === user?.id))
        .map(g => ({
          ...g,
          role: allMembers.find(m => m.group_id === g.id && m.user_id === user?.id)?.role ?? "member",
        }));
      setMyGroups(mine);
      setLoadingGroups(false);
      return;
    }

    if (!user) { setMyGroups([]); setLoadingGroups(false); return; }

    const { data, error } = await supabase
      .from("group_members")
      .select("role, groups(*)")
      .eq("user_id", user.id);

    if (!error && data) {
      setMyGroups(data.filter(r => r.groups).map(r => ({ ...r.groups, role: r.role })));
    }
    setLoadingGroups(false);
  }, [user]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  // Reset on logout
  useEffect(() => {
    if (!user) { setMyGroups([]); setActiveGroupId(null); setPendingInvites([]); }
  }, [user]);

  // ── Fetch pending invites for current user ─────────────────
  const fetchMyInvites = useCallback(async () => {
    if (!user) return;

    if (!supabase) {
      const all = localGet(LS_INVITES);
      setPendingInvites(all.filter(i => i.invited_email === user.email && i.status === "pending"));
      return;
    }

    const { data, error } = await supabase
      .from("group_invites")
      .select("*")
      .eq("invited_email", user.email)
      .eq("status", "pending");

    if (!error && data) setPendingInvites(data);
  }, [user]);

  useEffect(() => { fetchMyInvites(); }, [fetchMyInvites]);

  // ── Create group ───────────────────────────────────────────
  const createGroup = useCallback(async (name, emoji) => {
    const id          = uuidv4();
    const invite_code = makeInviteCode();
    const group       = { id, name, emoji, invite_code, created_by: user?.id };

    if (!supabase) {
      const member   = { group_id: id, user_id: user?.id, role: "owner", email: user?.email };
      const newGroup = { ...group, role: "owner" };
      localSave(LS_GROUPS,  [...localGet(LS_GROUPS), group]);
      localSave(LS_MEMBERS, [...localGet(LS_MEMBERS), member]);
      setMyGroups(prev => [...prev, newGroup]);
      setGroupMembers(prev => ({ ...prev, [id]: [member] }));
      return newGroup;
    }

    const { data: gData, error: gErr } = await supabase.from("groups").insert(group).select().single();
    if (gErr) { console.error(gErr); return null; }

    await supabase.from("group_members").insert({ group_id: gData.id, user_id: user.id, role: "owner" });

    const newGroup = { ...gData, role: "owner" };
    setMyGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, [user]);

  // ── Email helper ───────────────────────────────────────────
  async function sendInviteEmail({ email, group, inviteCode, invitedBy }) {
    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          to_email:    email,
          group_name:  group.name,
          group_emoji: group.emoji,
          invited_by:  invitedBy,
          invite_code: inviteCode ?? "",
        }
      );
    } catch (err) {
      console.warn("EmailJS send failed:", err);
    }
  }

  // ── Send invite by email ───────────────────────────────────
  const sendInvite = useCallback(async (groupId, email) => {
    const group = myGroups.find(g => g.id === groupId);
    if (!group) return { error: "Group not found" };

    if (!supabase) {
      const all = localGet(LS_INVITES);
      if (all.find(i => i.group_id === groupId && i.invited_email === email && i.status === "pending")) {
        return { error: "Invite already sent to this email" };
      }
      const invite = {
        id: uuidv4(),
        group_id: groupId,
        group_name: group.name,
        group_emoji: group.emoji,
        invited_email: email,
        invited_by_email: user?.email,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      localSave(LS_INVITES, [...all, invite]);
      await sendInviteEmail({ email, group, inviteCode: group.invite_code, invitedBy: user?.email });
      return { success: true };
    }

    // Check group capacity
    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);
    if (count >= 6) return { error: "Group is full (max 6 members)" };

    // Check existing invite / membership
    const { data: existing } = await supabase
      .from("group_invites")
      .select("id, status")
      .eq("group_id", groupId)
      .eq("invited_email", email)
      .maybeSingle();

    if (existing?.status === "pending")  return { error: "Invite already sent to this email" };
    if (existing?.status === "accepted") return { error: "This person is already in the group" };

    const { error } = await supabase.from("group_invites").upsert({
      group_id:         groupId,
      group_name:       group.name,
      group_emoji:      group.emoji,
      invited_email:    email,
      invited_by:       user.id,
      invited_by_email: user.email,
      status:           "pending",
    }, { onConflict: "group_id,invited_email" });

    if (error) return { error: error.message };

    await sendInviteEmail({ email, group, inviteCode: group.invite_code, invitedBy: user.email });
    return { success: true };
  }, [user, myGroups]);

  // ── Accept / decline invite ────────────────────────────────
  const respondToInvite = useCallback(async (inviteId, accept) => {
    const invite = pendingInvites.find(i => i.id === inviteId);
    if (!invite) return { error: "Invite not found" };

    if (!supabase) {
      const all = localGet(LS_INVITES).map(i =>
        i.id === inviteId ? { ...i, status: accept ? "accepted" : "declined" } : i
      );
      localSave(LS_INVITES, all);
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));

      if (accept) {
        const members = localGet(LS_MEMBERS);
        if (!members.find(m => m.group_id === invite.group_id && m.user_id === user?.id)) {
          localSave(LS_MEMBERS, [...members, { group_id: invite.group_id, user_id: user?.id, role: "member", email: user?.email }]);
        }
        const groups = localGet(LS_GROUPS);
        if (!groups.find(g => g.id === invite.group_id)) {
          localSave(LS_GROUPS, [...groups, {
            id: invite.group_id, name: invite.group_name, emoji: invite.group_emoji,
            invite_code: "", created_by: null,
          }]);
        }
        setMyGroups(prev => {
          if (prev.find(g => g.id === invite.group_id)) return prev;
          return [...prev, { id: invite.group_id, name: invite.group_name, emoji: invite.group_emoji, role: "member" }];
        });
      }
      return { success: true };
    }

    await supabase.from("group_invites")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", inviteId);

    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));

    if (accept) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", invite.group_id);
      if (count >= 6) return { error: "Group is now full" };

      const { error } = await supabase.from("group_members").insert({
        group_id: invite.group_id, user_id: user.id, role: "member",
      });
      if (error) return { error: error.message };
      await loadGroups();
    }
    return { success: true };
  }, [user, pendingInvites, loadGroups]);

  // ── Leave / delete group ───────────────────────────────────
  const leaveGroup = useCallback(async (groupId) => {
    if (!supabase) {
      localSave(LS_MEMBERS, localGet(LS_MEMBERS).filter(m => !(m.group_id === groupId && m.user_id === user?.id)));
      setMyGroups(prev => prev.filter(g => g.id !== groupId));
      if (activeGroupId === groupId) setActiveGroupId(null);
      return;
    }
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
    setMyGroups(prev => prev.filter(g => g.id !== groupId));
    if (activeGroupId === groupId) setActiveGroupId(null);
  }, [user, activeGroupId]);

  // ── Fetch members for a group ──────────────────────────────
  const fetchMembers = useCallback(async (groupId) => {
    if (!supabase) {
      const members = localGet(LS_MEMBERS).filter(m => m.group_id === groupId);
      setGroupMembers(prev => ({ ...prev, [groupId]: members }));
      return members;
    }
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id, role, joined_at")
      .eq("group_id", groupId);
    if (!error && data) {
      setGroupMembers(prev => ({ ...prev, [groupId]: data }));
      return data;
    }
    return [];
  }, []);

  return (
    <GroupsContext.Provider value={{
      myGroups,
      activeGroupId,
      setActiveGroupId,
      groupMembers,
      loadingGroups,
      pendingInvites,
      createGroup,
      sendInvite,
      respondToInvite,
      fetchMyInvites,
      leaveGroup,
      fetchMembers,
      reloadGroups: loadGroups,
    }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupsContext);
}
