import React from "react";
import Link from "next/link";
import { FaFacebookF, FaPinterest, FaTwitter } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { Container } from "../../util/container";

const socialLinks = [
  { key: "facebook", Icon: FaFacebookF },
  { key: "twitter", Icon: FaTwitter },
  { key: "instagram", Icon: AiFillInstagram },
  { key: "pinterest", Icon: FaPinterest },
];

export const Footer = ({ data }) => {
  return (
    <footer className="bg-gradient-to-br text-gray-800 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
      <Container className="relative" size="small">
        <div className="flex flex-row justify-between items-center">
          <div className="flex">
            <Link
              href="/"
              className="group mx-2 flex items-center font-bold tracking-tight text-gray-400 dark:text-gray-300 opacity-50 hover:opacity-100 transition duration-300 ease-out whitespace-nowrap">

              <img className="w-56 h-40 flex-none" src="/momma.svg" alt="All About Momma"/>

            </Link>
            {data.nav &&
            (
              <ul className="flex flex-col gap-2 p-12">
              {data.nav.map((item, i) => {
                return (
                    <li key={`${item.label}-${i}`} >
                      <a
                        href={`/${item.href}`}
                        className="relative select-none text-base text-gray-500 inline-block tracking-wide transition duration-150 ease-out hover:text-gray-900 px-2"
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex flex-grow w-40 text-xs text-gray-400 md:mx-12">
            <p>All About Momma is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate we earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.</p>
          </div>
          <div className="flex gap-4">
            {socialLinks.map(({ key, Icon }) =>
              data.social?.[key] ? (
                <a
                  key={key}
                  className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                  href={data.social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-7 w-auto" />
                </a>
              ) : null
            )}
          </div>
        </div>
        <div className="absolute h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent top-0 left-4 right-4 opacity-5"></div>
      </Container>
    </footer>
  );
};
