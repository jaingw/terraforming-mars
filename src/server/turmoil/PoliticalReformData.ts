import {JSONValue, JSONObject} from '../../common/Types';
import {PartyName} from '../../common/turmoil/PartyName';
import {PolicyId} from '../../common/turmoil/Types';

export type PoliticalReformData = PartyName | {partyName: PartyName, policyId: PolicyId};

function isPartyName(value: JSONValue): value is PartyName {
  return typeof value === 'string' && Object.values(PartyName).includes(value as PartyName);
}

function isPolicyId(value: JSONValue): value is PolicyId {
  return typeof value === 'string' && /^[msukrg]p0[1-4]$/.test(value);
}

function isPoliticalReformObject(data: JSONValue): data is JSONObject & {partyName: PartyName, policyId: PolicyId} {
  if (data === undefined || data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  const obj = data as JSONObject;
  return isPartyName(obj.partyName) && isPolicyId(obj.policyId);
}

export function getPoliticalReformPartyName(data: JSONValue): PartyName | undefined {
  if (data === undefined) {
    return undefined;
  }
  if (isPartyName(data)) {
    return data;
  }
  if (isPoliticalReformObject(data)) {
    return data.partyName;
  }
  return undefined;
}

export function getPoliticalReformPolicyId(data: JSONValue): PolicyId | undefined {
  if (isPoliticalReformObject(data)) {
    return data.policyId;
  }
  return undefined;
}
