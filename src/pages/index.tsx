import { useSession } from "next-auth/react";
import Head from "next/head";

import { RouterOutputs, api } from "~/utils/api";
import Header from "./components/Header";
import { useState } from "react";
import NoteEditor from "./components/NoteEditor";
import NoteCard from "./components/NoteCard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Note taker</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Content />
      </main>
    </>
  );
}

type Topic = RouterOutputs["topic"]["getAll"][0];

const Content: React.FC = () => {
  const { data: sessionData } = useSession();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const { data: topics, refetch: refetchTopics } = api.topic.getAll.useQuery(
    undefined, // no input
    {
      enabled: sessionData?.user !== undefined,
      onSuccess: (data) => setSelectedTopic(selectedTopic ?? data[0] ?? null),
    },
  );

  const createTopic = api.topic.create.useMutation({
    // void says "We're cool. Just ignore the return type."
    onSuccess: () => void refetchTopics(),
  });

  const { data: notes, refetch: refetchNotes } = api.note.getAll.useQuery(
    { topicId: selectedTopic?.id ?? "" },
    { enabled: sessionData?.user !== undefined && selectedTopic !== null },
  );

  const createNote = api.note.create.useMutation({
    onSuccess: () => void refetchNotes(),
  });

  const deleteNote = api.note.delete.useMutation({
    onSuccess: () => void refetchNotes,
  })

  return (
    <div className="mx-5 mt-5 grid grid-cols-4 gap-2">
      <div className="px-2">
        <ul className="menu w-56 rounded-box bg-base-100 p-2">
          {topics?.map((topic) => (
            <li key={topic.id}>
              <a
                href="#"
                onClick={(evt) => {
                  evt.preventDefault();
                  setSelectedTopic(topic);
                }}
              >
                {topic.title}
              </a>
            </li>
          ))}
        </ul>
        <div className="divider"></div>
        <input
          type="text"
          placeholder="New Topic"
          className="input input-sm input-bordered w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              createTopic.mutate({
                title: e.currentTarget.value,
              });
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div className="col-span-3">
      <div>
          {notes?.map((note) => (
            <div key={note.id} className="mt-5">
              <NoteCard
                note={note}
                onDelete={() => void deleteNote.mutate({ id: note.id })}
              />
            </div>
          ))}
        </div>
        <NoteEditor
          onSave={({ title, content }) => {
            void createNote.mutate({
              title,
              content,
              topicId: selectedTopic?.id ?? "",
            });
          }}
        />
      </div>
    </div>
  );
};

// function AuthShowcase() {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.post.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// }
