import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, Clock } from "lucide-react";
import ChatInput from "@/components/ChatInput";
import { generateScript } from "@/lib/api";

export default function ScriptsPage() {
  const location = useLocation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [script, setScript] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (topic: string) => {
    setGenerating(true);
    setError('');
    setSelectedTopic(topic);
    try {
      const result = await generateScript(topic);
      setScript(result);
    } catch (err) {
      setError('Failed to generate script. Please try again.');
    } finally {
      setGenerating(false);
    }
  };