import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { solutionGithubUrl } = await request.json();

  if (!solutionGithubUrl) {
    return NextResponse.json({ success: false, message: 'Missing solutionGithubUrl' }, { status: 400 });
  }

  try {
    const urlParts = solutionGithubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/commit\/([a-f0-9]+)/i);

    if (!urlParts || urlParts.length < 4) {
      return NextResponse.json({ success: false, message: 'Invalid GitHub commit URL format' }, { status: 400 });
    }

    const [, owner, repo, commitSha] = urlParts;

    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
      console.error('GITHUB_PAT environment variable is not set.');
      return NextResponse.json({ success: false, message: 'Server configuration error: GitHub PAT missing.' }, { status: 500 });
    }

    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;

    const response = await fetch(githubApiUrl, {
      headers: {
        'Authorization': `token ${githubPat}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Basic check: if data contains a SHA, assume commit exists
      if (data.sha === commitSha) {
        return NextResponse.json({ success: true, message: 'GitHub commit verified successfully.' });
      } else {
        return NextResponse.json({ success: false, message: 'GitHub commit not found or invalid.' }, { status: 404 });
      }
    } else {
      const errorData = await response.json();
      console.error(`GitHub API error: ${response.status} - ${errorData.message}`);
      return NextResponse.json({ success: false, message: `GitHub API error: ${errorData.message}` }, { status: response.status });
    }
  } catch (error: any) {
    console.error('Error verifying GitHub commit:', error);
    return NextResponse.json({ success: false, message: `Internal server error: ${error.message}` }, { status: 500 });
  }
}