import { Card, CardContent } from '@/components/ui/card';

export default function Inout() {
  return (
    <Card 
      className="w-full"
      style={{
        "backgroundColor": "#ffffff",
        "borderRadius": "0px",
        "minHeight": "392px",
        "paddingTop": "32px",
        "paddingRight": "32px",
        "paddingBottom": "64px",
        "paddingLeft": "32px"
}}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Inout</h3>
        <div className="mb-4">
        <div className="mb-4">
        <div className="mb-4">
        <p className="text-sm">Input</p>
        <p className="text-sm">Displays a form input field or a component that looks like an input field.</p>
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
          INSTANCE: input
        </div>
      </CardContent>
    </Card>
  );
}