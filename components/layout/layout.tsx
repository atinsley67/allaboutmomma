import React from "react";
import Head from "next/head";
import Script from "next/script";
import { Header } from "./header";
import { Footer } from "./footer";
import { cloudinaryImage } from "../util/cloudinary";
import layoutData from "../../content/global/index.json";

export const Layout = ({ rawData = {}, data = layoutData, children }) => {
  let title = "All About Momma"
  let description = "All About Momma Description"
  let image = ""
  let url = "https://allaboutmomma.com"
  let articleJsonLd = null
  const headerData = (rawData as any)
  if ( headerData.page ) {
    title = headerData.page.title + " | " + data.header.name
    description = headerData.page.description
    image = headerData.page.heroImg
    if (headerData.page._sys.filename != 'home') {
      url = url + "/" + headerData.page._sys.filename
    }
  } else if ( headerData.post ) {
    title = headerData.post.title
    description = headerData.post.description
    image = headerData.post.heroImg
    url = url + "/" + headerData.post._sys.filename
    articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: headerData.post.title,
      description,
      image: cloudinaryImage(image, 1200) || undefined,
      datePublished: headerData.post.date || undefined,
      author: headerData.post.author?.name
        ? { "@type": "Person", name: headerData.post.author.name }
        : undefined,
      mainEntityOfPage: url,
    }
  } else if (headerData.category ) {
    title = headerData.category.title + " | " + data.header.name
    description = headerData.category.description
    image = headerData.category.heroImg
    url = url + "/category/" + headerData.category._sys.filename
  }
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={`${url}`}/>
        <meta name="description" content={`${description}`}/>
        <meta property="og:title" content={`${title}`} />
        <meta property="og:type" content={articleJsonLd ? "article" : "website"} />
        <meta property="og:image" content={`${cloudinaryImage(image, 1200)}`} />
        <meta property="og:url" content={`${url}`} />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="UTF-8"/>
        {articleJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
        )}
      </Head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-8KPLZ7P9KL" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8KPLZ7P9KL');
        `}
      </Script>
      <Script id="mailerlite" strategy="afterInteractive">
        {`
          (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
          .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
          n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
          (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
          ml('account', '496565');
        `}
      </Script>
      <Script
        src="https://classic.avantlink.com/affiliate_app_confirm.php?mode=js&authResponse=bdc767b67917aeb2888499a4458e09fd146869de"
        strategy="afterInteractive"
      />
      <div className="min-h-screen flex flex-col font-montserrat">
        <Header data={data?.header} />
        <div className="flex-1 text-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000 flex flex-col">
          {children}
        </div>
        <Footer data={data?.footer} />
      </div>
    </>
  );
};
