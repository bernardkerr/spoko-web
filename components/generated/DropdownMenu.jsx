import { Card, CardContent } from '@/components/ui/card';

export default function DropdownMenu() {
  return (
    <Card 
      className="w-full"
      style={{
        "backgroundColor": "#ffffff",
        "borderRadius": "0px",
        "minHeight": "724.000244140625px",
        "paddingTop": "32px",
        "paddingRight": "32px",
        "paddingBottom": "64px",
        "paddingLeft": "32px"
}}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dropdown Menu</h3>
        <div className="mb-4">
        <div className="mb-4">
        <div className="mb-4">
        <p className="text-sm">Dropdown Menu</p>
        <p className="text-sm">Displays a menu to the user — such as a set of actions or functions — triggered by a button.</p>
        </div>
        <div className="mb-4">
        <div className="mb-2 p-2 border border-gray-200 rounded text-xs text-gray-500">
          INSTANCE: button
        </div>
        </div>
        </div>
        <div className="mb-2 p-2 border border-gray-200 rounded text-xs text-gray-500">
          LINE: Line 2
        </div>
        </div>
        <div className="mb-2 p-2 border border-gray-200 rounded text-xs text-gray-500">
          COMPONENT: dropdown menu
        </div>
      </CardContent>
    </Card>
  );
}