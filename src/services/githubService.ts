import { Octokit } from "octokit";
import { Endpoints, RequestParameters } from "@octokit/types";
import { Service } from "typedi";

@Service()
export default class githubService {
  octokit: Octokit = new Octokit(
    (process.env.GITHUB_TOKEN && { auth: process.env.GITHUB_TOKEN }) || {}
  );
  async doRequest(path: string, options: any): Promise<any> {
    return await this.octokit.request(path, {
      ...options,
      owner: "The-Coding-Empire",
      repo: "discord-bot",
    });
  }
  async getIssue(
    options: RequestParameters
  ): Promise<
    Endpoints["GET /repos/{owner}/{repo}/issues/{issue_number}"]["response"]
  > {
    return await this.doRequest(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      options
    );
  }

  async getIssues(
    options: RequestParameters
  ): Promise<Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]> {
    return await this.doRequest("GET /repos/{owner}/{repo}/issues", options);
  }

  async getPullRequest(
    options: RequestParameters
  ): Promise<
    Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"]
  > {
    return await this.doRequest(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      options
    );
  }

  async getPullRequests(
    options: RequestParameters
  ): Promise<Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]> {
    return await this.doRequest("GET /repos/{owner}/{repo}/pulls", options);
  }
  
  async getCodeOwners(
    options?: RequestParameters
  ): Promise<Endpoints["GET /repos/{owner}/{repo}/contributors"]["response"]> {
    return await this.doRequest("GET /repos/{owner}/{repo}/contributors", options);
  }
}
