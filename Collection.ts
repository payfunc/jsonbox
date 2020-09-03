import * as gracely from "gracely"
import { fetch, Response as FetchResponse } from "./fetch"
import { Document } from "./Document"

export interface parameterInterface {
	method: string
	jsonId?: string
	bodyResource?: Record<string, unknown>
	metaData?: boolean
}

export class Collection<T> {
	private readonly headers: { [key: string]: string }
	constructor(private readonly url: string = "https://jsonbox.io", private readonly boxId: string) {
		this.headers = {
			"Content-Type": "application/json; charset=utf-8",
			Accept: "application/json; charset=utf-8",
		}
	}
	private async fetchResponse(input: { method: string; jsonId?: string; bodyResource?: any; metaData?: boolean }) {
		const body = JSON.stringify(input.bodyResource, undefined, "  ")
		const url =
			this.url + (input.metaData ? "/_meta/" : "/") + this.boxId + (input.jsonId == undefined ? "" : "/" + input.jsonId)
		const response = await fetch(url, {
			method: input.method,
			headers: this.headers,
			body,
		})
		return response.ok ? response.json() : this.getError(response)
	}

	async create(resource: T): Promise<Document<T> | gracely.Error> {
		return this.fetchResponse({ method: "POST", bodyResource: resource })
	}

	async list(): Promise<Document<T>[] | gracely.Error> {
		return this.fetchResponse({ method: "GET" })
	}
	async get(id: string): Promise<Document<T> | gracely.Error> {
		return this.fetchResponse({ method: "GET", jsonId: id })
	}
	async delete(id: string): Promise<true | gracely.Error> {
		return this.fetchResponse({ method: "DELETE", jsonId: id })
	}
	async update(resource: T, id: string): Promise<true | gracely.Error> {
		return this.fetchResponse({ method: "PUT", jsonId: id, bodyResource: resource })
	}
	async getMetadata(): Promise<T | gracely.Error> {
		return this.fetchResponse({ method: "PUT", metaData: true })
	}

	private async getError(response: FetchResponse): Promise<gracely.Error> {
		return gracely.server.backendFailure({
			status: response.status,
			body: response.headers.get("Content-Type")?.includes("json") ? await response.json() : await response.text(),
		})
	}
}
