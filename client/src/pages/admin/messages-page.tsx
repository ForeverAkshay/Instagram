
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MessagesPage() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const res = await fetch('/api/contact');
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
      <div className="space-y-4">
        {messages?.map((msg: any) => (
          <Card key={msg.id}>
            <CardHeader>
              <CardTitle>{msg.name} ({msg.email})</CardTitle>
              <div className="text-sm text-gray-500">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{msg.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
