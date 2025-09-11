import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Check, Loader2, AlertCircle, Mic, FileText, Volume2 } from "lucide-react";

interface ProcessingStatusProps {
  podcastId: string | null;
}

export default function ProcessingStatus({ podcastId }: ProcessingStatusProps) {
  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/podcast", podcastId, "status"],
    enabled: !!podcastId,
    refetchInterval: (data) => {
      // Stop refetching when completed or failed
      const statusData = data as any;
      if (statusData?.status === "completed" || statusData?.status === "failed") {
        return false;
      }
      return 2000; // Refetch every 2 seconds
    },
  });

  if (!podcastId) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Clock className="text-primary mr-2" size={20} />
            Generation Status
          </h3>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Click "Generate Podcast" to start creating your AI podcast</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Clock className="text-primary mr-2" size={20} />
            Generation Status
          </h3>
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-muted-foreground">Loading status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStepStatus = (stepName: string) => {
    if (!status) return "pending";
    const statusData = status as any;
    
    const statusMap = {
      "processing": "analysis",
      "generating_script": "script", 
      "generating_audio": "audio",
      "completed": "completed",
      "failed": "failed"
    };

    const currentStep = statusMap[statusData?.status as keyof typeof statusMap];
    
    const steps = ["analysis", "script", "audio", "processing"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(stepName);
    
    if (statusData?.status === "failed") return "failed";
    if (statusData?.status === "completed") return "completed";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getProgressPercentage = () => {
    if (!status) return 0;
    const statusData = status as any;
    
    const progressMap = {
      "processing": 25,
      "generating_script": 50,
      "generating_audio": 75,
      "completed": 100,
      "failed": 0
    };
    
    return progressMap[statusData?.status as keyof typeof progressMap] || 0;
  };

  const steps = [
    {
      id: "analysis",
      title: "Content Analysis", 
      description: "Analyzing article structure and key points",
      icon: FileText
    },
    {
      id: "script",
      title: "Script Generation",
      description: "Creating natural dialogue between hosts", 
      icon: FileText
    },
    {
      id: "audio", 
      title: "Voice Synthesis",
      description: "Converting script to audio with selected voices",
      icon: Mic
    },
    {
      id: "processing",
      title: "Audio Processing", 
      description: "Mixing and finalizing podcast audio",
      icon: Volume2
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Clock className="text-primary mr-2" size={20} />
          Generation Status
        </h3>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm text-muted-foreground" data-testid="text-overall-progress">
              {getProgressPercentage()}%
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Processing Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const stepStatus = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center space-x-3" data-testid={`step-${step.id}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepStatus === "completed" 
                    ? "bg-green-500"
                    : stepStatus === "active"
                    ? "bg-primary"
                    : stepStatus === "failed"
                    ? "bg-destructive"
                    : "bg-muted"
                }`}>
                  {stepStatus === "completed" ? (
                    <Check className="text-white" size={16} />
                  ) : stepStatus === "active" ? (
                    <Loader2 className="text-white animate-spin" size={16} />
                  ) : stepStatus === "failed" ? (
                    <AlertCircle className="text-white" size={16} />
                  ) : (
                    <Icon className="text-muted-foreground" size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    stepStatus === "pending" ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {stepStatus === "active" && (
                    <div className="w-full bg-muted rounded-full h-1 mt-2">
                      <div className="bg-primary h-1 rounded-full animate-pulse w-2/3"></div>
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  stepStatus === "completed" 
                    ? "text-green-500"
                    : stepStatus === "active"
                    ? "text-primary"
                    : stepStatus === "failed"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}>
                  {stepStatus === "completed" 
                    ? "Complete"
                    : stepStatus === "active" 
                    ? "In Progress"
                    : stepStatus === "failed"
                    ? "Failed"
                    : "Pending"
                  }
                </span>
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center flex items-center justify-center">
            <AlertCircle className="mr-2" size={16} />
            {(status as any)?.status === "completed" 
              ? "Podcast generation complete! You can now play and download your podcast."
              : (status as any)?.status === "failed"
              ? "Generation failed. Please try again with different content or settings."
              : "Estimated time remaining: 2-3 minutes"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
