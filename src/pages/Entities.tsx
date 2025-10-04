import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, MapPin, Calendar, Eye } from 'lucide-react';
import { entitiesApi, EntityType, Entity } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/ui/badge';

export default function Entities() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EntityType>('character');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const { data: entities, isLoading } = useQuery({
    queryKey: ['entities', projectId, activeTab],
    queryFn: async () => {
      const response = await entitiesApi.getByProject(Number(projectId), activeTab);
      return response.data;
    },
    enabled: !!projectId,
  });

  const getIcon = (type: EntityType) => {
    switch (type) {
      case 'character':
        return <Users className="h-5 w-5" />;
      case 'location':
        return <MapPin className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
    }
  };

  const handleEntityClick = async (entityId: number) => {
    try {
      const response = await entitiesApi.getById(entityId);
      setSelectedEntity(response.data);
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/project/${projectId}`)}
          className="mb-4 -ml-2"
        >
          ← Back to Project
        </Button>
        <h1 className="text-4xl font-bold mb-2">Story Entities</h1>
        <p className="text-muted-foreground">
          Explore the characters, locations, and events from your story
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="character" className="gap-2">
            <Users className="h-4 w-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="event" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader text={`Loading ${activeTab}s...`} />
          </div>
        ) : (
          <>
            {['character', 'location', 'event'].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {entities && entities.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {entities.map((entity) => (
                      <Card
                        key={entity.id}
                        className="hover:shadow-elevated transition-all cursor-pointer animate-fade-in"
                        onClick={() => handleEntityClick(entity.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                              {getIcon(entity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="truncate text-base">
                                {entity.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 mt-1 text-xs">
                                {entity.description || 'No description'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button variant="ghost" size="sm" className="w-full gap-2">
                            <Eye className="h-3 w-3" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground">
                      {getIcon(activeTab)}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      No {activeTab}s found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Analyze a script to extract {activeTab}s
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>

      <Dialog open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {selectedEntity && getIcon(selectedEntity.type)}
              </div>
              <div>
                <DialogTitle className="text-2xl">{selectedEntity?.name}</DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  {selectedEntity?.type}
                </Badge>
              </div>
            </div>
            <DialogDescription className="text-base mt-4">
              {selectedEntity?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntity?.attributes && Object.keys(selectedEntity.attributes).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3">Additional Details</h4>
              <div className="space-y-2">
                {Object.entries(selectedEntity.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
