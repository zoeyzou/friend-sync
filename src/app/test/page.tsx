import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

export default function ThemeTest() {
  return (
    <div className="min-h-screen py-12 px-6 bg-linear-to-br from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-5xl font-bold bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          shadcn Theme Works!
        </h1>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Green Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-8">
            <Input placeholder="Green input ✨" />
            <div className="flex gap-3 flex-wrap">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Danger</Button>
            </div>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              Perfect theme!
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
