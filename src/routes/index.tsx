import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Settings2 } from "lucide-react";
import { FlowsTab } from "@/components/wa/FlowsTab";
import { QuickSendTab } from "@/components/wa/QuickSendTab";
import { MediaLibraryTab } from "@/components/wa/MediaLibraryTab";
import { getApiBase, setApiBase } from "@/lib/wa-api";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panel del Bot de WhatsApp" },
      {
        name: "description",
        content:
          "Administra flujos automáticos, envía mensajes manuales y gestiona la biblioteca de archivos de tu bot de WhatsApp.",
      },
      { property: "og:title", content: "Panel del Bot de WhatsApp" },
      {
        property: "og:description",
        content: "Administra flujos automáticos y envía mensajes desde una sola interfaz.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [showConfig, setShowConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    const current = getApiBase();
    setApiUrl(current);
    if (!current) setShowConfig(true);
  }, []);

  const saveBase = () => {
    setApiBase(apiUrl.trim());
    toast.success("URL del backend guardada");
    setShowConfig(false);
    // Refresh data-bound tabs
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Bot WhatsApp</h1>
              <p className="text-xs text-muted-foreground">Panel de administración</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowConfig((s) => !s)}>
            <Settings2 className="mr-2 size-4" />
            API
          </Button>
        </div>
        {showConfig && (
          <div className="border-t bg-muted/30">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  URL del backend (ej. http://localhost:3000)
                </label>
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                />
              </div>
              <Button onClick={saveBase}>Guardar</Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="flows" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:max-w-xl">
            <TabsTrigger value="flows">Flujos automáticos</TabsTrigger>
            <TabsTrigger value="send">Respuesta rápida</TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
          </TabsList>
          <TabsContent value="flows" className="mt-6">
            <FlowsTab />
          </TabsContent>
          <TabsContent value="send" className="mt-6">
            <QuickSendTab />
          </TabsContent>
          <TabsContent value="library" className="mt-6">
            <MediaLibraryTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
