import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, FileAudio, FileText, FileVideo, ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, getApiBase, type MediaItem } from "@/lib/wa-api";

const ICONS = {
  image: ImageIcon,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
};

export function MediaLibraryTab() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api
      .mediaList()
      .then(setItems)
      .catch((e) => toast.error("Error al cargar archivos", { description: e.message }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await api.upload(file);
      }
      toast.success(`${files.length} archivo(s) subido(s)`);
      load();
    } catch (e) {
      toast.error("Error al subir", { description: (e as Error).message });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const copy = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      toast.success("Ruta copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar archivo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto">
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onUpload(e.target.files)}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            Subir archivos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/30 py-16 text-center text-sm text-muted-foreground">
          {items.length === 0 ? "No hay archivos en la biblioteca." : "Sin resultados."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const Icon = ICONS[item.type];
            const src = item.url ?? `${getApiBase()}${item.path}`;
            return (
              <Card key={item.path} className="overflow-hidden">
                <div className="flex aspect-video items-center justify-center bg-muted">
                  {item.type === "image" ? (
                    <img src={src} alt={item.name} className="size-full object-cover" />
                  ) : (
                    <Icon className="size-10 text-muted-foreground" />
                  )}
                </div>
                <CardContent className="space-y-2 p-3">
                  <p className="truncate text-sm font-medium" title={item.name}>
                    {item.name}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground" title={item.path}>
                    {item.path}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => copy(item.path)}
                  >
                    <Copy className="mr-2 size-4" />
                    Copiar ruta
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}