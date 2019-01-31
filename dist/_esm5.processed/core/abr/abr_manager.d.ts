/**
 * Copyright 2015 CANAL+ Group
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Observable } from "rxjs";
import { Adaptation, ISegment, Representation } from "../../manifest";
import { IBufferType } from "../source_buffers";
import { IABRBufferEvents, IABREstimation, IRepresentationChooserClockTick, IRequest } from "./representation_chooser";
interface IMetricValue {
    duration: number;
    size: number;
    content: {
        representation: Representation;
        adaptation: Adaptation;
        segment: ISegment;
    };
}
interface IMetric {
    type: IBufferType;
    value: IMetricValue;
}
export declare type IABRClockTick = IRepresentationChooserClockTick;
interface IRepresentationChoosersOptions {
    limitWidth: Partial<Record<IBufferType, Observable<number>>>;
    throttle: Partial<Record<IBufferType, Observable<number>>>;
    initialBitrates: Partial<Record<IBufferType, number>>;
    manualBitrates: Partial<Record<IBufferType, number>>;
    maxAutoBitrates: Partial<Record<IBufferType, number>>;
}
/**
 * Adaptive BitRate Manager.
 *
 * Select the right representation from the network and buffer infos it
 * receives.
 * @class ABRManager
 */
export default class ABRManager {
    private readonly _dispose$;
    private _choosers;
    private _chooserInstanceOptions;
    private _mediaElement;
    /**
     * @param {HTMLMediaElement} mediaElement
     * @param {Observable} requests$ - Emit requests infos as they begin, progress
     * and end.
     * Allows to know if a request take too much time to be finished in
     * emergency times (e.g. when the user's bandwidth falls very quickly).
     *
     * The items emitted are Observables which each emit infos about a SINGLE
     * request. These infos are under the form of objects with the following keys:
     *   - type {string}: the buffer type (example: "video")
     *
     *   - event {string}: Wether the request started, is progressing or has
     *     ended. Should be either one of these three strings:
     *       1. "requestBegin": The request has just begun.
     *
     *       2. "progress": Informations about the request progress were received
     *          (basically the amount of bytes currently received).
     *
     *       2. "requestEnd": The request just ended (successfully/on error/was
     *          canceled)
     *
     *     Note that it should ALWAYS happen in the following order:
     *     1 requestBegin -> 0+ progress -> 1 requestEnd
     *
     *     Also note that EVERY requestBegin should eventually be followed by a
     *     requestEnd at some point. If that's not the case, a memory leak
     *     can happen.
     *
     *   - value {Object|undefined}: The value depends on the type of event
     *     received:
     *       - for "requestBegin" events, it should be an object with the
     *         following keys:
     *           - id {number|String}: The id of this particular request.
     *           - duration {number}: duration, in seconds of the asked segment.
     *           - time {number}: The start time, in seconds of the asked segment.
     *           - requestTimestamp {number}: the timestamp at which the request
     *             was sent, in ms.
     *
     *       - for "progress" events, it should be an object with the following
     *         keys:
     *           - id {number|String}: The id of this particular request.
     *           - size {number}: amount currently downloaded, in bytes
     *           - timestamp {number}: timestamp at which the progress event was
     *             received, in ms
     *         Those events SHOULD be received in order (that is, in increasing
     *         order for both size and timestamp).
     *
     *       - for "requestEnd" events:
     *           - id {number|String}: The id of this particular request.
     *
     * @param {Observable} metrics$ - Emit each times the network downloaded
     * a new segment for a given buffer type. Allows to obtain informations about
     * the user's bitrate.
     *
     * The items emitted are objects with the following keys:
     *   - type {string}: the buffer type (example: "video")
     *   - value {Object}:
     *     - duration {number}: duration of the request, in seconds.
     *     - size {number}: size of the downloaded chunks, in bytes.
     *
     * @param {Object|undefined} options
     */
    constructor(mediaElement: HTMLMediaElement, requests$: Observable<Observable<IRequest>>, metrics$: Observable<IMetric>, options?: IRepresentationChoosersOptions);
    /**
     * Take type and an array of the available representations, spit out an
     * observable emitting the best representation (given the network/buffer
     * state).
     * @param {string} type
     * @param {Array.<Representation>|undefined} representations
     * @param {Observable<Object>} clock$
     * @param {Observable<Object>} bufferEvents$
     * @returns {Observable}
     */
    get$(type: IBufferType, representations: Representation[] | undefined, clock$: Observable<IABRClockTick>, bufferEvents$: Observable<IABRBufferEvents>): Observable<IABREstimation>;
    /**
     * Set manually the bitrate for a given type.
     *
     * The given number will act as a ceil.
     * If no representation is found with the given bitrate, we will consider:
     *   1. The representation just lower than it
     *   2. If no representation is found in the previous step, the representation
     *   with the lowest bitrate.
     *
     * @param {string} type
     * @param {number} bitrate
     */
    setManualBitrate(type: IBufferType, bitrate: number): void;
    /**
     * Set a maximum bitrate a given type will be able to automatically switch to.
     * The chooser for the given type can still emit higher bitrates with the
     * setManualBitrate method.
     * @param {string} supportedBufferTypes
     * @param {number} bitrate
     */
    setMaxAutoBitrate(type: IBufferType, bitrate: number): void;
    /**
     * Returns the set (and active) manual bitrate for the given type.
     * @param {string} supportedBufferTypes
     * @returns {number|undefined}
     */
    getManualBitrate(type: IBufferType): number | undefined;
    /**
     * Returns the set (and active) maximum auto bitrate for the given type.
     * @param {string} supportedBufferTypes
     * @returns {number|undefined}
     */
    getMaxAutoBitrate(type: IBufferType): number | undefined;
    /**
     * Clean every ressources linked to the ABRManager.
     * The ABRManager is unusable after calling this method.
     */
    dispose(): void;
    /**
     * If it doesn't exist, create a RepresentationChooser under the
     * _choosers[bufferType] property.
     * @param {string} bufferType
     * @returns {Object}
     */
    private _lazilyCreateChooser;
}
export { IRequest as IABRRequest, IMetric as IABRMetric, IRepresentationChoosersOptions as IABROptions, };
