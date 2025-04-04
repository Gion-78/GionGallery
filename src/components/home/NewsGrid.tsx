
import { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  category: string;
}

const newsData: NewsItem[] = [
  {
    id: 1,
    title: "New Character Announcement: Gear 5 Luffy Coming Soon",
    excerpt: "The highly anticipated Gear 5 Luffy will be joining the roster with unique abilities and transformations.",
    date: "2023-05-15",
    imageUrl: "https://images.unsplash.com/photo-1616627052149-22c4329faaf8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    category: "Characters"
  },
  {
    id: 2,
    title: "Upcoming Events: Grand Line Festival Returns",
    excerpt: "The Grand Line Festival returns with exclusive rewards, challenges, and limited-time events for all players.",
    date: "2023-05-12",
    imageUrl: "https://images.unsplash.com/photo-1460194436988-671f763436b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Events"
  },
  {
    id: 3,
    title: "Version 2.5 Update: New PvP Mode and Balance Changes",
    excerpt: "The latest update introduces a new PvP arena mode, major balance adjustments, and quality-of-life improvements.",
    date: "2023-05-10",
    imageUrl: "https://images.unsplash.com/photo-1635048424329-5acf74cb8940?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1165&q=80",
    category: "Updates"
  },
  {
    id: 4,
    title: "Collaboration Event: One Piece Film Red Characters Join the Battle",
    excerpt: "Characters from One Piece Film Red, including Uta, will be available in a limited-time collaboration event.",
    date: "2023-05-08",
    imageUrl: "https://images.unsplash.com/photo-1636207543865-acf3ad382295?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    category: "Collaborations"
  },
  {
    id: 5,
    title: "Developer Update: Roadmap for 2023 Revealed",
    excerpt: "The development team shares their plans for upcoming content, features, and improvements throughout 2023.",
    date: "2023-05-05",
    imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80",
    category: "Developer Notes"
  },
  {
    id: 6,
    title: "Community Spotlight: Player Achievements and Fan Art",
    excerpt: "Celebrating the creativity and accomplishments of our amazing community members from around the world.",
    date: "2023-05-03",
    imageUrl: "https://images.unsplash.com/photo-1531715047058-5c3df03ea5ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1168&q=80",
    category: "Community"
  }
];

const NewsGrid = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [visibleNews, setVisibleNews] = useState<NewsItem[]>([]);
  
  const categories = ["All", "Characters", "Events", "Updates", "Collaborations", "Developer Notes", "Community"];
  
  useEffect(() => {
    if (activeCategory === "All") {
      setVisibleNews(newsData);
    } else {
      setVisibleNews(newsData.filter(item => item.category === activeCategory));
    }
  }, [activeCategory]);

  return (
    <section className="section-padding bg-background">
      <div className="container container-padding mx-auto">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Latest News & Updates</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleNews.map((news) => (
            <div 
              key={news.id}
              className="group bg-card rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                <span className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                  {news.category}
                </span>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(news.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {news.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {news.excerpt}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-300"
                >
                  Read More 
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="#" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md transition-all duration-300 hover:bg-secondary/80"
          >
            View All News
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
