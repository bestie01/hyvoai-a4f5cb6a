import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Loader2, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Eye,
  Palette,
  Type,
  ImageIcon
} from 'lucide-react';

interface AnalysisResult {
  score: number;
  breakdown: {
    category: string;
    score: number;
    feedback: string;
    icon: string;
  }[];
  suggestions: string[];
  strengths: string[];
}

export function ThumbnailAnalyzer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!imagePreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload a thumbnail to analyze.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-thumbnail-analysis', {
        body: { imageUrl: imagePreview }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: 'Analysis Complete! 🎯',
        description: `Your thumbnail scored ${data.score}/100`,
      });
    } catch (error) {
      console.error('[THUMBNAIL-ANALYZER] Error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze thumbnail. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-amber-500';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const getCategoryIcon = (icon: string) => {
    const icons: Record<string, React.ReactNode> = {
      eye: <Eye className="w-4 h-4" />,
      palette: <Palette className="w-4 h-4" />,
      type: <Type className="w-4 h-4" />,
      image: <ImageIcon className="w-4 h-4" />,
    };
    return icons[icon] || <Zap className="w-4 h-4" />;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Pikzels Score Analyzer
        </CardTitle>
        <CardDescription>
          Upload a thumbnail to get an AI-powered effectiveness score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Thumbnail preview"
                  className="max-h-48 mx-auto rounded-lg shadow-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={loading || !imagePreview}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Analyze Thumbnail
            </>
          )}
        </Button>

        {/* Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="text-center p-6 bg-card/50 rounded-xl border border-border">
              <h3 className="text-sm text-muted-foreground mb-2">Pikzels Score</h3>
              <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </div>
              <Badge className="mt-2" variant="outline">
                {getScoreLabel(analysis.score)}
              </Badge>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold">Score Breakdown</h4>
              {analysis.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getCategoryIcon(item.icon)}
                      {item.category}
                    </span>
                    <span className={getScoreColor(item.score)}>{item.score}/100</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{item.feedback}</p>
                </div>
              ))}
            </div>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
