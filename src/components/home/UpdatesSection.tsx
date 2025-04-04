import { Clock, Star, DownloadCloud } from 'lucide-react';

interface UpdateItem {
  id: number;
  title: string;
  type: string;
  status: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

const updates: UpdateItem[] = [
  {
    id: 1,
    title: "Server Maintenance Scheduled",
    type: "Maintenance",
    status: "Upcoming",
    timestamp: "2023-05-16T08:00:00Z",
    priority: "high"
  },
  {
    id: 2,
    title: "Version 2.5.2 Hotfix Release",
    type: "Patch",
    status: "Live",
    timestamp: "2023-05-14T15:30:00Z",
    priority: "medium"
  },
  {
    id: 3,
    title: "Daily Login Rewards Refresh",
    type: "Event",
    status: "Live",
    timestamp: "2023-05-14T00:00:00Z",
    priority: "low"
  },
  {
    id: 4,
    title: "Ranked Season 8 Ending Soon",
    type: "Notice",
    status: "Upcoming",
    timestamp: "2023-05-20T23:59:59Z",
    priority: "medium"
  },
  {
    id: 5,
    title: "New Story Chapter Available",
    type: "Content",
    status: "Live",
    timestamp: "2023-05-13T10:00:00Z",
    priority: "high"
  }
];

const priorityStyles = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30"
};

const statusStyles = {
  Live: "bg-primary/20 text-primary border-primary/30",
  Upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30"
};

const UpdatesSection = () => {
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - updateTime.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      // Future event
      const absSeconds = Math.abs(diffInSeconds);
      if (absSeconds < 3600) return `In ${Math.floor(absSeconds / 60)} minutes`;
      if (absSeconds < 86400) return `In ${Math.floor(absSeconds / 3600)} hours`;
      return `In ${Math.floor(absSeconds / 86400)} days`;
    }
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Since this is a dummy link, we'll create a simple text file to demonstrate download
    const blob = new Blob(['This is a dummy game download file.'], { type: 'text/plain' });
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'game-v2.5.2.zip';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container container-padding mx-auto">
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Real-Time Updates</h2>
          <p className="text-center text-muted-foreground max-w-2xl">
            Stay informed with the latest game updates, server status, and important announcements.
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Latest Activity
            </h3>
            <div className="flex items-center">
              <span className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                All Systems Operational
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {updates.map((update) => (
              <div 
                key={update.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-card border border-border/40 hover:border-border/60 transition-all duration-300"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${priorityStyles[update.priority]}`}>
                      {update.priority.charAt(0).toUpperCase() + update.priority.slice(1)} Priority
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border bg-secondary/50 border-border/30 text-muted-foreground">
                      {update.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusStyles[update.status as keyof typeof statusStyles]}`}>
                      {update.status}
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-foreground">{update.title}</h4>
                </div>
                <div className="mt-2 md:mt-0 flex items-center text-muted-foreground text-sm">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatRelativeTime(update.timestamp)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-card border border-border/20 rounded-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-medium flex items-center">
                  <DownloadCloud className="w-5 h-5 mr-2 text-primary" />
                  Latest Game Version
                </h4>
                <p className="text-muted-foreground mt-1">Version 2.5.2 is now available for download</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-muted" />
                    <span className="ml-2 text-sm text-muted-foreground">4.2/5</span>
                  </div>
                </div>
                <a 
                  href="#" 
                  onClick={handleDownload}
                  download="game-v2.5.2.zip"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-all duration-300 hover:bg-primary/90 text-sm"
                >
                  Download Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;
