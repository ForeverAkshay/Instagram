import { useQuery } from "@tanstack/react-query";
import { Brand, ReviewWithUser } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReviewForm from "./review-form";
import { StarIcon } from "lucide-react";

export default function BrandCard({ brand }: { brand: Brand }) {
  const { data: reviews } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/brands/${brand.id}/reviews`],
  });

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{brand.name}</span>
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
            <span>{averageRating.toFixed(1)}</span>
          </div>
        </CardTitle>
        <a
          href={`https://instagram.com/${brand.instagramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:underline"
        >
          @{brand.instagramHandle}
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Recent Reviews</h3>
            <div className="space-y-2">
              {reviews?.slice(0, 2).map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                    <a
                      href={`https://instagram.com/${review.userInstagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      @{review.userInstagramHandle}
                    </a>
                  </div>
                  <div className="text-sm text-gray-600">
                    {review.reviewText.length > 100
                      ? review.reviewText.substring(0, 97) + "..."
                      : review.reviewText}
                  </div>
                  {review.imageUrl && (
                    <img 
                      src={review.imageUrl} 
                      alt="Review photo" 
                      className="mt-2 max-h-32 rounded-md" 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Write Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review {brand.name}</DialogTitle>
              </DialogHeader>
              <ReviewForm brandId={brand.id} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
