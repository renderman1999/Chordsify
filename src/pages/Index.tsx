import { useState } from "react";
import { Header } from "@/components/Header";
import { AudioUploader } from "@/components/AudioUploader";
import { AudioWaveform } from "@/components/AudioWaveform";
import { ChordDisplay, ChordSection } from "@/components/ChordDisplay";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyzeAudio } from "@/lib/analyzeAudio";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [chordData, setChordData] = useState<ChordSection[] | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setChordData(null);
  };

  const handleProcessAudio = async () => {
    if (!selectedFile) {
      toast.error("Please upload an audio file first");
      return;
    }

    setIsProcessing(true);
    toast.info("Processing audio...");

    try {
      const chords = await analyzeAudio(selectedFile);
      if (chords.length === 0) {
        toast.warning("No chords detected in this file");
        setChordData([]);
      } else {
        setChordData(chords);
        toast.success("Audio processed successfully!");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze audio";
      toast.error(message);
      setChordData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Transform Audio into Guitar Chords & Tabs
            </h2>
            <p className="text-lg text-music-muted max-w-2xl mx-auto">
              Upload your audio file and let our AI detect chords and generate tablature automatically.
            </p>
          </div>

          {!selectedFile ? (
            <AudioUploader onFileSelected={handleFileSelected} />
          ) : (
            <div className="space-y-8">
              <AudioWaveform
                filename={selectedFile.name}
                isProcessing={isProcessing}
              />

              {!chordData && !isProcessing && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleProcessAudio}
                    className="gap-2"
                  >
                    Process Audio
                  </Button>
                </div>
              )}

              {chordData && chordData.length > 0 && (
                <ChordDisplay chordSections={chordData} />
              )}

              {selectedFile && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setChordData(null);
                    }}
                  >
                    Upload Different File
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-music-surface">
        <div className="container text-center text-music-muted text-sm">
          <p>Chordsify - Convert Audio to Guitar Chords & Tabs</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
