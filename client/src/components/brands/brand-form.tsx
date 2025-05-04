import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBrandSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

const brandFormSchema = insertBrandSchema.extend({
  categoryId: z.coerce.number(),
});

type BrandFormData = z.infer<typeof brandFormSchema>;

export default function BrandForm() {
  const { toast } = useToast();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      instagramHandle: "",
      categoryId: 0, // Set a default numeric value instead of undefined
    },
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const brandMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      const res = await apiRequest("POST", "/api/brands", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      toast({
        title: "Brand added",
        description: "The brand has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add brand",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => brandMutation.mutate(data))}
        className="space-y-4"
      >
        <div>
          <Input
            placeholder="Brand Name"
            {...form.register("name")}
          />
        </div>

        <div>
          <Input
            placeholder="Instagram Handle (without @)"
            {...form.register("instagramHandle")}
          />
        </div>

        <div>
          <Select
            value={form.watch("categoryId")?.toString() || "0"}
            onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={brandMutation.isPending}>
            Add Brand
          </Button>
        </div>
      </form>
    </Form>
  );
}
