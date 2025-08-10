import { Card, CardContent } from '@/components/ui/card';

export default function ScrollArea() {
  return (
    <Card 
      className="w-full"
      style={{
        "backgroundColor": "#ffffff",
        "borderRadius": "0px",
        "minHeight": "578px",
        "paddingTop": "32px",
        "paddingRight": "32px",
        "paddingBottom": "64px",
        "paddingLeft": "32px"
}}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Scroll Area</h3>
        <div className="mb-4">
        <div className="mb-4">
        <div className="mb-4">
        <p className="text-sm">Scroll Area</p>
        <p className="text-sm">Visually or semantically separates content.
</p>
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
          COMPONENT: scroll-area
        </div>
      </CardContent>
    </Card>
  );
}