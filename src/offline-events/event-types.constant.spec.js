/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

describe('EVENT_TYPES', function() {

    beforeEach(function() {
        module('offline-events');

        inject(function($injector) {
            this.EVENT_TYPES = $injector.get('EVENT_TYPES');
        });
    });

    describe('getLabel', function() {

        it('should return label for valid event type', function() {
            expect(this.EVENT_TYPES.getLabel('ISSUE')).toEqual('offlineEvents.issue');
            expect(this.EVENT_TYPES.getLabel('RECEIVE')).toEqual('offlineEvents.receive');
            expect(this.EVENT_TYPES.getLabel('ADJUSTMENT')).toEqual('offlineEvents.adjustment');
        });

        it('should throw exception for invalid event type', function() {
            var EVENT_TYPES = this.EVENT_TYPES;

            expect(function() {
                EVENT_TYPES.getLabel('NON_EXISTENT_ROLE');
            }).toThrow('"NON_EXISTENT_ROLE" is not a valid event type');

            expect(function() {
                EVENT_TYPES.getLabel(undefined);
            }).toThrow('"undefined" is not a valid event type');

            expect(function() {
                EVENT_TYPES.getLabel(null);
            }).toThrow('"null" is not a valid event type');

            expect(function() {
                EVENT_TYPES.getLabel('');
            }).toThrow('"" is not a valid event type');
        });

    });

    describe('EVENT_TYPES', function() {

        it('should return a map of event types', function() {
            expect(this.EVENT_TYPES.getEventTypes()).toEqual({
                ISSUE: this.EVENT_TYPES.ISSUE,
                RECEIVE: this.EVENT_TYPES.RECEIVE,
                ADJUSTMENT: this.EVENT_TYPES.ADJUSTMENT
            });
        });

    });

});
