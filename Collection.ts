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
	async create(resource: T): Promise<Document<T> | gracely.Error> {
		const body = JSON.stringify(resource, undefined, "  ")
		const response = await fetch(this.url + "/" + this.boxId, { method: "POST", headers: this.headers, body })
		return response.ok ? response.json() : this.getError(response)
	}

	async list(): Promise<Document<T>[] | gracely.Error> {
		const response = await fetch(this.url + "/" + this.boxId, { method: "GET", headers: this.headers })
		return response.ok ? response.json() : this.getError(response)
	}
	async get(id: string): Promise<Document<T> | gracely.Error> {
		const response = await fetch(this.url + "/" + this.boxId + "/" + id, { method: "GET", headers: this.headers })
		return response.ok ? response.json() : this.getError(response)
	}
	async delete(id: string): Promise<true | gracely.Error> {
		const response = await fetch(this.url + "/" + this.boxId + "/" + id, { method: "DELETE", headers: this.headers })
		return response.ok ? response.json() : this.getError(response)
	}
	async update(resource: T, id: string): Promise<true | gracely.Error> {
		const body = JSON.stringify(resource, undefined, "  ")
		const response = await fetch(this.url + "/" + this.boxId + "/" + id, { method: "PUT", headers: this.headers, body })
		return response.ok ? response.json() : this.getError(response)
	}
	async getMetadata(): Promise<T | gracely.Error> {
		const response = await fetch(this.url + "/_meta/" + this.boxId, { method: "PUT", headers: this.headers })
		return response.ok ? response.json() : this.getError(response)
	}

	private async getError(response: FetchResponse): Promise<gracely.Error> {
		return gracely.server.backendFailure({
			status: response.status,
			body: response.headers.get("Content-Type")?.includes("json") ? await response.json() : await response.text(),
		})
	}
}
