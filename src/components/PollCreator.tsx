import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePolls } from '@/hooks/usePolls';
import { Plus, X, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PollCreatorProps {
  streamId: string;
}

export const PollCreator = ({ streamId }: PollCreatorProps) => {
  const { activePoll, createPoll, vote, endPoll } = usePolls(streamId);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [voterName, setVoterName] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    const validOptions = options.filter(o => o.trim());
    if (question && validOptions.length >= 2) {
      await createPoll(question, validOptions, 300);
      setQuestion('');
      setOptions(['', '']);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (activePoll && voterName) {
      await vote(activePoll.id, optionIndex, voterName);
      setShowResults(true);
    }
  };

  const getTotalVotes = () => {
    if (!activePoll) return 0;
    return activePoll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : (votes / total) * 100;
  };

  if (activePoll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Poll</span>
            <Button variant="outline" size="sm" onClick={() => endPoll(activePoll.id)}>
              End Poll
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold text-lg">{activePoll.question}</h3>

          {!showResults ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="voter-name">Your Name</Label>
                <Input
                  id="voter-name"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Enter your name to vote"
                />
              </div>

              <div className="space-y-2">
                {activePoll.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleVote(index)}
                    disabled={!voterName}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {activePoll.options.map((option, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span className="font-medium">
                      {option.votes} ({getPercentage(option.votes).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={getPercentage(option.votes)} />
                </div>
              ))}
              <p className="text-sm text-muted-foreground text-center">
                Total votes: {getTotalVotes()}
              </p>
            </div>
          )}

          {showResults && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResults(false)}
              className="w-full"
            >
              Back to Voting
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Create Poll
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What's your question?"
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {options.length < 6 && (
          <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        )}

        <Button
          onClick={handleCreatePoll}
          disabled={!question || options.filter(o => o.trim()).length < 2}
          className="w-full"
        >
          Create Poll
        </Button>
      </CardContent>
    </Card>
  );
};
