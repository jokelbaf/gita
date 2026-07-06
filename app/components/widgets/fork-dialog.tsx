import { GitForkIcon } from "lucide-react";
import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ForkDialogProps {
  slug: string;
  name: string;
}

export function ForkDialog({ slug, name }: ForkDialogProps) {
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const action = `/widgets/${slug}/fork`;
  const submitting =
    navigation.state !== "idle" && navigation.formAction === action;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <GitForkIcon />
          Fork
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form method="post" action={action} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Fork this widget</DialogTitle>
            <DialogDescription>
              Creates a private copy you own and opens it in the editor. Later
              edits won’t affect the original.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="fork-name">Name</Label>
            <Input
              id="fork-name"
              name="name"
              defaultValue={`${name} (fork)`}
              maxLength={60}
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Forking…" : "Create fork"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
