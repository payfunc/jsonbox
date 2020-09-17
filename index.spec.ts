import * as JsonBox from "./index"
import { Document } from "./Document"

interface TestObject {
	name: string
	boolean: boolean
	aValue: number
}
function getTestObject() {
	return {
		name: "Testname",
		boolean: true,
		aValue: 126,
	}
}
const collection = new JsonBox.Collection<TestObject>("https://jsonbox.io", "1234567890asdfghjklqwer")
async function createTestId(): Promise<string> {
	const result = await collection.create(getTestObject())
	expect(Document.is(result)).toBeTruthy()
	return Document.is(result) ? result._id : ""
}
describe("JsonBox", () => {
	it("create", async () => {
		expect(await collection.create(getTestObject())).toMatchObject(getTestObject())
	})
	it("list", async () => {
		await collection.create(getTestObject())
		expect(((await collection.list()) as any)[0]).toMatchObject(getTestObject())
	})
	it("delete", async () => {
		expect(await collection.delete(await createTestId())).toMatchObject({ message: "Record removed." })
	})
	it("update", async () => {
		expect(
			await collection.update({ name: "Testname2", boolean: true, aValue: 42 }, await createTestId())
		).toMatchObject({ message: "Record updated." })
	})
	it("get", async () => {
		expect(await collection.get(await createTestId())).toMatchObject(getTestObject())
	})
})
