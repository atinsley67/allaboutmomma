import { Actions } from "../util/actions";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Link from "next/link";
import React, { useState, useEffect } from 'react';

export const Post = ({ data, tinaField }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState([]);

  const fetchData = async (page) => {
    try {
      const response = await fetch(`path/to/data/file${page}.json`);
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <div>
      {/* Pagination controls */}
      <button onClick={goToPreviousPage}>Previous</button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button key={index + 1} onClick={() => goToPage(index + 1)}>
          {index + 1}
        </button>
      ))}
      <button onClick={goToNextPage}>Next</button>

      {/* Post cards */}
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <h2 className="post-title">{post.title}</h2>
          <p className="post-author">By {post.author}</p>
          <ul className="post-categories">
            {post.categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
          <p className="post-intro">{post.introText}</p>
        </div>
      ))}
    </div>
  );
};

export const PaginatedPosts = ({ data, parentField }) => {

  return (
    <Section color={data.color}>
      <Container
        className="text-center justify-center"
        size="small"
      >
        <div>
          <h2 className="text-xl font-bold">{data.title}</h2>
        </div>
        <div className="mx-auto px-0 py-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 max-w-[500px] md:max-w-[800px] lg:max-w-[1200px] ">
        {data.items.map((item, i) => (
          <Post
            tinaField={`${parentField}.items.${i}`}
            key={i}
            data={item}
          />
        ))}
        </div>
      </Container>
    </Section>
  );
};


export const paginatedPostsBlockSchema = {
  name: "paginatedPosts",
  label: "Paginated Posts",
  ui: {
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" },
      ],
    },
  ],
};
