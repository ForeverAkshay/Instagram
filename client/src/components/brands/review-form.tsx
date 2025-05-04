import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const reviewFormSchema = insertReviewSchema.extend({
  rating: z.coerce.number().min(1).max(5),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

export default function ReviewForm({ brandId }: { brandId: number }) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      brandId,
      rating: 5,
      reviewText: "",
      imageUrl: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const res = await apiRequest("POST", `/api/brands/${brandId}/reviews`, {
        ...data,
        imageUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/brands/${brandId}/reviews`] });
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a data URL for the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => reviewMutation.mutate(data))}
        className="space-y-4"
      >
        <div>
          <Select
            value={form.watch("rating")?.toString() || "5"}
            onValueChange={(value) => form.setValue("rating", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={rating.toString()}>
                  {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Textarea
            placeholder="Write your review..."
            {...form.register("reviewText")}
          />
        </div>

        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Review photo preview"
              className="mt-2 max-h-40 rounded-md"
            />
          )}
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={reviewMutation.isPending}>
            Submit Review
          </Button>
        </div>
      </form>
    </Form>
  );
}
