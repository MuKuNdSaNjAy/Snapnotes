const COLORS = [
  { value: "yellow", bg: "bg-yellow-300", ring: "ring-yellow-400" },
  { value: "pink",   bg: "bg-pink-300",   ring: "ring-pink-400"   },
  { value: "orange", bg: "bg-orange-300", ring: "ring-orange-400" },
  { value: "blue",   bg: "bg-blue-300",   ring: "ring-blue-400"   },
  { value: "green",  bg: "bg-green-300",  ring: "ring-green-400"  },
  { value: "purple", bg: "bg-purple-300", ring: "ring-purple-400" },
];

export default function ColorPicker({ current, onSelect }) {
  return (
    <div className="flex gap-2 p-2 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
      {COLORS.map(({ value, bg, ring }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          title={value}
          className={`w-6 h-6 rounded-full ${bg} transition-transform duration-150 hover:scale-110 ${
            current === value ? `ring-2 ring-offset-1 ${ring} scale-110` : ""
          }`}
        />
      ))}
    </div>
  );
}
