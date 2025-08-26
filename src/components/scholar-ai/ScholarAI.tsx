'use client';

import { askQuestion } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, FileText, Loader2, Send, UploadCloud, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const MOCK_PDF_TEXT = `To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men’s motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results. Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention, while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature. He was still, as ever, deeply attracted by the study of crime, and occupied his immense faculties and extraordinary powers of observation in following out those clues, and clearing up those mysteries which had been abandoned as hopeless by the official police. From time to time I heard some vague account of his doings: of his summons to Odessa in the case of the Trepoff murder, of his clearing up of the singular tragedy of the Atkinson brothers at Trincomalee, and finally of the mission which he had accomplished so delicately and successfully for the reigning family of Holland. Beyond these signs of his activity, however, which I merely shared with all the readers of the daily press, I knew little of my former friend and companion.`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const HighlightedContent = ({
  text,
  highlights,
}: {
  text: string;
  highlights: string[];
}) => {
  if (!highlights || highlights.length === 0) {
    return <div className="whitespace-pre-wrap p-6">{text}</div>;
  }

  let highlightedText = text;
  highlights.forEach(highlight => {
    const regex = new RegExp(escapeRegExp(highlight), 'g');
    highlightedText = highlightedText.replace(
      regex,
      `<mark class="bg-accent/30 text-primary rounded-sm px-1 py-0.5">${highlight}</mark>`
    );
  });

  return (
    <div
      className="whitespace-pre-wrap p-6 text-sm"
      dangerouslySetInnerHTML={{ __html: highlightedText.replace(/\n/g, '<br />') }}
    />
  );
};

export function ScholarAI() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedExcerpts, setHighlightedExcerpts] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTop =
        chatScrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfText(MOCK_PDF_TEXT);
      setChatHistory([
        {
          role: 'assistant',
          content: `I've loaded the document. What would you like to know about "${file.name}"?`,
        },
      ]);
      setHighlightedExcerpts([]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const newQuestion = currentQuestion.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: newQuestion }]);
    setCurrentQuestion('');
    setIsLoading(true);
    setHighlightedExcerpts([]);

    const result = await askQuestion({
      question: newQuestion,
      pdfContent: pdfText,
    });

    setIsLoading(false);

    if (result.success) {
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: result.answer! },
      ]);
      setHighlightedExcerpts(result.excerpts || []);
    } else {
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });
    }
  };

  if (!pdfFile) {
    return (
      <main className="flex h-screen w-full items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md animate-in fade-in-50 duration-500">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">
              ScholarAI
            </CardTitle>
            <CardDescription className="text-foreground/80">
              Upload a PDF to start an intelligent conversation with your
              documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => fileInputRef.current?.click()}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload PDF
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="grid h-screen w-full grid-cols-1 lg:grid-cols-2 gap-4 p-4 animate-in fade-in-50 duration-500">
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Viewer
          </CardTitle>
          <CardDescription>{pdfFile.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full rounded-md border">
            <HighlightedContent
              text={pdfText}
              highlights={highlightedExcerpts}
            />
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Bot className="h-5 w-5" />
            ScholarAI Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about the document and get AI-powered answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={chatScrollAreaRef}>
            <div className="space-y-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border-2 border-primary">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={handleQuestionSubmit}
            className="flex w-full items-center gap-2"
          >
            <Textarea
              placeholder="Type your question here..."
              value={currentQuestion}
              onChange={e => setCurrentQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuestionSubmit(e);
                }
              }}
              rows={1}
              className="min-h-[40px] max-h-24 flex-grow resize-none"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  );
}
