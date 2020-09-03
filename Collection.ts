import * as gracely from "gracely"
import { fetch, Response as FetchResponse } from "./fetch"
import { Document } from "./Document"

export class Collection<T> {
	private readonly headers: { [key: string]: string }
	constructor(private readonly url: string = "https://jsonbox.io", private readonly boxId: string) {
		this.headers = {
			"Content-Type": "application/json; charset=utf-8",
			Accept: "application/json; charset=utf-8",
		}
	}

	private async fetchResponse(method: string, bodyResource?: T, id?: string, metaData?: boolean) {
		const body = JSON.stringify(bodyResource, undefined, "  ")
		const url = this.url + (metaData ? "/_meta/" : "/") + this.boxId + (id == undefined ? "" : "/" + id)
		const response = await fetch(url, {
			method: method,
			headers: this.headers,
			body,
		})
		return response.ok ? response.json() : this.getError(response)
	}

	async create(resource: T): Promise<Document<T> | gracely.Error> {
		return this.fetchResponse("POST", resource, undefined)
	}

	async list(): Promise<Document<T>[] | gracely.Error> {
		return this.fetchResponse("GET", undefined, undefined)
	}
	async get(id: string): Promise<Document<T> | gracely.Error> {
		return this.fetchResponse("GET", undefined, id)
	}
	async delete(id: string): Promise<true | gracely.Error> {
		return this.fetchResponse("DELETE", undefined, id)
	}
	async update(resource: T, id: string): Promise<true | gracely.Error> {
		return this.fetchResponse("PUT", resource, id)
	}
	async getMetadata(): Promise<T | gracely.Error> {
		return this.fetchResponse("PUT", undefined, undefined, true)
	}

	private async getError(response: FetchResponse): Promise<gracely.Error> {
		return gracely.server.backendFailure({
			status: response.status,
			body: response.headers.get("Content-Type")?.includes("json") ? await response.json() : await response.text(),
		})
	}
}
