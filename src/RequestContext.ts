import { Context } from 'alkali'
export class RequestContext extends Context {
	preferJSON: boolean // used by JSONStream to assist with direct JSON transfers
	request: any
	session: any
	constructor(request, session, user?) {
		super(user)
		this.request = request
		this.session = session
	}
	newContext() {
		return new this.constructor(this.request, this.session, this.subject)
	}
	get expectedVersions(): Map<any, Promise<any>> {
		const session = this.session || (this.session = {})
		return session.expectedVersions || (session.expectedVersions = {})
	}
}

export const DEFAULT_CONTEXT = {
	expectedVersions: {}
}
