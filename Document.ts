export class Document<T> {
	_id: string
}
export namespace Document {
	export function is<T>(value: Document<T> | any): value is Document<T> {
		return typeof value == "object" && typeof value._id == "string"
	}
}
