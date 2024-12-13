import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Media {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  availability: boolean;
  user_id: string;
}

export function Stats({ media }: { media: Media[] }) {
  const available = media.filter(m => m.availability).length
  const unavailable = media.filter(m => !m.availability).length
  const total = media.length

  return (
    <div className="mb-6">
      <Card className="col-span-1 md:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {total} media listings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={(available / total) * 100} className="h-2" />
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Available ({available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Not Available ({unavailable})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

