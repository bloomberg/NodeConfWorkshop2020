/*
 ** Copyright 2020 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */
import { Temporal } from "proposal-temporal";
import { Record, Tuple, Box } from "@bloomberg/record-tuple-polyfill";

const now = Temporal.now.absolute()
const oneTwoThreeNow = #[1, 2, 3, Box(now)];

console.log(oneTwoThreeNow.slice(0, 3));
console.log(oneTwoThreeNow[3].unbox().toString());
