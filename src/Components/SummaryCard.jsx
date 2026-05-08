export default function SummaryCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const currentColor = colors[color] || colors.blue;

  return (
    <div className={`p-6 rounded-3xl border shadow-sm ${currentColor}`}>
      <p className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</p>
      <p className="text-4xl font-black mt-2">{value}</p>
    </div>


  );
}

// Simple explanation of the above code:
// 1)This is a React functional component called SummaryCard.
// 2)It takes in two props: title and value.
// 3)The component returns a styled card that displays the title and value.
// 4)The card has a white background, rounded corners, a shadow effect, and a border.
// 5)The title is displayed in smaller, gray text, while the value is displayed in larger, bold text.
// 6)The card also has padding for spacing.