import { client } from "../../../.tina/__generated__/client";
import { getIntro } from "../../../components/util/propsUtils"

// Use the props returned by get static props
export default function PostsDataPage() {
  return 
}

export const getServerSideProps = async ({ params, res }) => {
  const allPostsData = await client.queries.allPostsQuery();
  
  const postsPerPage = 6; // Replace N with the desired number of posts per page
  const currentPage = parseInt(params.filename.replace("page", ""));
  
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  
  const pagePosts = allPostsData.data.postConnection.edges.slice(startIndex, endIndex);

  const totalPages = Math.ceil(allPostsData.data.postConnection.edges.length / postsPerPage);

  await Promise.all(
    pagePosts.map(async (post: any) => {

      const intro = getIntro(post.node._body, 50)
      delete post.node._body
      post.node.intro = intro
      
    })
  );

   // Set the response headers to specify JSON content type
  //res.setHeader("Content-Type", "application/json");

  res.write(
    JSON.stringify(
      {
        props: {
          totalPages: totalPages,
          pagePosts,
        }
      }));
  
  // Return the JSON data as the response
  res.end();
  
  return { props: { }}
};