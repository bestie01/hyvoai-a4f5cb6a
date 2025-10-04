import { useState } from 'react';
import { Trophy, Target, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIGameCoach } from '@/hooks/useAIGameCoach';

export function AIGameCoach() {
  const [game, setGame] = useState('Valorant');
  const [kills, setKills] = useState(18);
  const [deaths, setDeaths] = useState(12);
  const [assists, setAssists] = useState(5);
  const [accuracy, setAccuracy] = useState(45);
  const [sessionDuration, setSessionDuration] = useState(25);

  const { analyzePerformance, coaching, loading } = useAIGameCoach();

  const handleAnalyze = () => {
    const metrics = {
      kills,
      deaths,
      assists,
      accuracy,
      kda: parseFloat(((kills + assists) / Math.max(deaths, 1)).toFixed(2)),
    };
    analyzePerformance(game, metrics, sessionDuration);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">AI Game Performance Coach</h3>
          <p className="text-sm text-muted-foreground">Get personalized feedback on your gameplay</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Input
              id="game"
              value={game}
              onChange={(e) => setGame(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Session Duration (min)</Label>
            <Input
              id="duration"
              type="number"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kills">Kills</Label>
            <Input
              id="kills"
              type="number"
              value={kills}
              onChange={(e) => setKills(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deaths">Deaths</Label>
            <Input
              id="deaths"
              type="number"
              value={deaths}
              onChange={(e) => setDeaths(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assists">Assists</Label>
            <Input
              id="assists"
              type="number"
              value={assists}
              onChange={(e) => setAssists(parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accuracy">Accuracy (%)</Label>
            <Input
              id="accuracy"
              type="number"
              value={accuracy}
              onChange={(e) => setAccuracy(parseInt(e.target.value))}
            />
          </div>
        </div>

        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Performance...
            </>
          ) : (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Analyze Performance
            </>
          )}
        </Button>
      </Card>

      {coaching && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Coaching Report</h3>
            <Badge variant="outline" className="text-lg">
              {coaching.overall_rating}/10
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-green-500" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {coaching.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-orange-500" />
                Areas to Improve
              </h4>
              <ul className="space-y-1">
                {coaching.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {weakness}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Improvement Roadmap
              </h4>
              <div className="space-y-3">
                {coaching.improvement_areas.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{area.skill}</span>
                      <span className="text-muted-foreground">
                        {area.current} → {area.target}
                      </span>
                    </div>
                    <Progress value={(area.current / area.target) * 100} />
                    <p className="text-xs text-muted-foreground">{area.advice}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Quick Tips</h4>
              <div className="space-y-2">
                {coaching.tips.map((tip, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{tip.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tip.description}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          tip.priority === 'high' 
                            ? 'destructive' 
                            : tip.priority === 'medium' 
                            ? 'default' 
                            : 'secondary'
                        }
                      >
                        {tip.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
