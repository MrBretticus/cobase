import when from '../util/when'
import * as bufferStream from 'mach/lib/utils/bufferStream'
import { jsonMediaType } from './JSONStream'

export const mediaTypes = new Map()
export function media(app) {
	return (connection) => {
		let headers = connection.request.headers
		const options = {
			charset: 'utf8'
		}
		const contentType = headers['Content-Type']
		if (contentType) {
			let [mimeType, optionsString] = contentType.split(/\s*;\s*/)
			if (optionsString) {
				optionsString.replace(/([^=]+)=([^;]+)/g, (t, name, value) =>
					options[name] = value)
			}
			const parser = mediaTypes.get(mimeType)
			if (!parser || !parser.parse) {
				connection.status = 415
				connection.response.content = 'Unsupported media type ' + mimeType
				return
			}
			if (parser.handlesRequest) {
				return when(parser.handle(connection), () =>
					when(connection.call(app), () => serializer(connection)))
			}
			return bufferStream(connection.request.content).then(data => {
				connection.request.data = parser.parse(data.toString(options.charset))
				return when(connection.call(app), () => serializer(connection))
			})
		}
		return when(connection.call(app), () => serializer(connection))
	}
}
function serializer(connection) {
	if (connection.response.data === undefined)
		return // nothing to serialize
	let requestHeaders = connection.request.headers
	let acceptHeader = requestHeaders.Accept || '*/*'
	let responseHeaders = connection.response.headers
	responseHeaders.vary = (responseHeaders.vary ? responseHeaders.vary + ',' : '') + 'Accept'
	let bestSerializer = jsonMediaType // default for now, TODO: return a 415
	let bestQuality = 0
	let bestType = 'application/json'
	const acceptTypes = acceptHeader.split(/\s*,\s*/);
	for (const acceptType of acceptTypes) {
		const [type, ...parameterParts] = acceptType.split(/\s*;\s*/)
		let clientQuality = 1
		const parameters = { q: 1 }
		for(const part of parameterParts) {
			const equalIndex = part.indexOf('=')
			parameters[part.substring(0, equalIndex)] = part.substring(equalIndex + 1)
		}
		clientQuality = +parameters.q
		const serializer = mediaTypes.get(type)
		if (serializer) {
			const quality = (serializer.q || 1) * clientQuality
			if (quality > bestQuality) {
				bestSerializer = serializer
				bestType = type
				bestQuality = quality
			}
		}
	}
	responseHeaders['Content-Type'] = bestType
	connection.response.content = bestSerializer.serialize(connection.response.data, connection)
}

mediaTypes.set('application/json', jsonMediaType)
