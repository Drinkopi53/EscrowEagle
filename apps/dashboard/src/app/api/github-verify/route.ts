import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { solutionGithubUrl } = await request.json();

  if (!solutionGithubUrl) {
    return NextResponse.json({ success: false, message: 'Missing solutionGithubUrl' }, { status: 400 });
  }

  try {
    // This regex now accepts both commit and pull request URLs
    const urlParts = solutionGithubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/(?:pull|commit)\/([a-zA-Z0-9]+)/i);

    if (!urlParts || urlParts.length < 4) {
      return NextResponse.json({ success: false, message: 'Invalid GitHub URL format. Please provide a direct link to a commit or pull request.' }, { status: 400 });
    }

    const [, owner, repo, id] = urlParts;
    const isPullRequest = solutionGithubUrl.includes('/pull/');

    // For this basic verification, we'll just check if the commit/PR exists.
    // A more robust solution would use different API endpoints for commits vs. PRs.
    const commitSha = isPullRequest ? '' : id; // This part is simplified for now
    const githubApiUrl = isPullRequest 
      ? `https://api.github.com/repos/${owner}/${repo}/pulls/${id}`
      : `https://api.github.com/repos/${owner}/${repo}/commits/${id}`;

    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
      console.error('GITHUB_PAT environment variable is not set.');
      return NextResponse.json({ success: false, message: 'Server configuration error: GitHub PAT missing.' }, { status: 500 });
    }

    const response = await fetch(githubApiUrl, {
      headers: {
        'Authorization': `token ${githubPat}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Basic check: if the request was successful (response.ok), assume it's valid.
      return NextResponse.json({ success: true, message: 'GitHub URL verified successfully.' });
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
