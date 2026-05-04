// ✅ Import sans accolades car c'est un export par défaut
import kyInstance from "@/lib/ky"; 
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post-details", postId],
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}`).json<PostData>(),
    enabled: !!postId,
  });
}