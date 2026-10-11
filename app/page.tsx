import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Teams &amp; Projects</h1>
      <p>
        A deliberately small B2B app: people sign in, join a team, and the team creates projects. It exists to show
        how <a href="https://useatune.com/docs">Atune</a> fits into a real Next.js app.
      </p>
      <ul>
        <li>
          Every signed-in request is captured by <code>proxy.ts</code> and attributed to the team (the customer
          account) and the user.
        </li>
        <li>
          Creating and exporting a project also send named events with <code>track()</code>.
        </li>
        <li>
          <code>npm run ask</code> asks Atune about a team with <code>understand()</code>.
        </li>
      </ul>
      <p>
        <Link href="/projects">Open your projects</Link>
      </p>
    </>
  );
}
