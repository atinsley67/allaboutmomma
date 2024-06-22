import React from "react";
import Link from "next/link";
import { FaFacebookF, FaPinterest, FaTwitter } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { Container } from "../../util/container";
import { useTheme } from "..";

export const Footer = ({ data, rawData }) => {
  const theme = useTheme();
  const socialIconClasses = "h-7 w-auto";
  const socialIconColorClasses = {
    blue: "text-blue-500 dark:text-blue-400 hover:text-blue-300",
    teal: "text-teal-500 dark:text-teal-400 hover:text-teal-300",
    green: "text-green-500 dark:text-green-400 hover:text-green-300",
    red: "text-red-500 dark:text-red-400 hover:text-red-300",
    pink: "text-pink-500 dark:text-pink-400 hover:text-pink-300",
    purple: "text-purple-500 dark:text-purple-400 hover:text-purple-300",
    orange: "text-orange-500 dark:text-orange-400 hover:text-orange-300",
    yellow: "text-yellow-500 dark:text-yellow-400 hover:text-yellow-300",
    primary: "text-white opacity-80 hover:opacity-100",
  };

  const footerColor = {
    default:
      "text-gray-800 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000",
    primary: {
      blue: "text-white from-blue-500 to-blue-700",
      teal: "text-white from-teal-500 to-teal-600",
      green: "text-white from-green-500 to-green-600",
      red: "text-white from-red-500 to-red-600",
      pink: "text-white from-pink-500 to-pink-600",
      purple: "text-white from-purple-500 to-purple-600",
      orange: "text-white from-orange-500 to-orange-600",
      yellow: "text-white from-yellow-500 to-yellow-600",
    },
  };

  const footerColorCss =
    data.color === "primary"
      ? footerColor.primary[theme.color]
      : footerColor.default;

  // If we're on an admin path, other links should also link to their admin paths
  const [prefix, setPrefix] = React.useState("");

  React.useEffect(() => {
    if (window && window.location.pathname.startsWith("/admin")) {
      setPrefix("/admin");
    }
  }, []);

  return (
    <footer className={`bg-gradient-to-br ${footerColorCss}`}>
      <Container className="relative" size="small">
        <div className="flex flex-row justify-between items-center">
          <div className="flex">
            <Link href="/" passHref>
              <a className="group mx-2 flex items-center font-bold tracking-tight text-gray-400 dark:text-gray-300 opacity-50 hover:opacity-100 transition duration-300 ease-out whitespace-nowrap">
              <img className="w-56 h-40 flex-none" src="/momma.svg" alt="All About Momma"/>
              </a>
            </Link>
            {data.nav &&
            (
              <ul className="flex flex-col gap-2 p-12">
              {data.nav.map((item, i) => {
                return (
                    <li key={`${item.label}-${i}`} >
                      <a href={`${prefix}/${item.href}`}>
                        <a className={"relative select-none text-base text-gray-500 inline-block tracking-wide transition duration-150 ease-out hover:text-gray-900 px-2"} >
                          {item.label}
                        </a>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex flex-grow w-40 text-xs text-gray-400 md:mx-12">
            <p>All About Momma is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for us by linking to amazon.com and its partners. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.</p>
          </div>
          <div className="flex gap-4">
            {data.social && data.social.facebook && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={data.social.facebook}
                target="_blank"
              >
                <FaFacebookF
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      data.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {data.social && data.social.twitter && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={data.social.twitter}
                target="_blank"
              >
                <FaTwitter
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      data.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {data.social && data.social.instagram && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={data.social.instagram}
                target="_blank"
              >
                <AiFillInstagram
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      data.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
            {data.social && data.social.pinterest && (
              <a
                className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                href={data.social.pinterest}
                target="_blank"
              >
                <FaPinterest
                  className={`${socialIconClasses} ${
                    socialIconColorClasses[
                      data.color === "primary" ? "primary" : theme.color
                    ]
                  }`}
                />
              </a>
            )}
          </div>
        </div>
        <div
          className={`absolute h-1 bg-gradient-to-r from-transparent ${
            data.color === "primary" ? `via-white` : `via-black dark:via-white`
          } to-transparent top-0 left-4 right-4 opacity-5`}
        ></div>
      </Container>
    </footer>
  );
};
