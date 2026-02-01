"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateBandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}

export function CreateBandDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateBandDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
      setName("");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create band.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose>
        <DialogHeader>
          <DialogTitle>Create band</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <label className="text-sm font-medium">
            Band name
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Band"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </label>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
