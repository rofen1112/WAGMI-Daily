import copy
import json
import sys
import unittest
import urllib.error
from pathlib import Path
from unittest.mock import patch,MagicMock
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'ai-lab'))
from server.provider import BananaRouterProvider, CodexHandoffProvider, ProviderError, create_default_provider


class ProviderTests(unittest.TestCase):
    def setUp(self):
        self.p=BananaRouterProvider({'AI_LAB_BANANAROUTER_KEY':'private-test-secret','AI_LAB_API_IMAGE_VERIFIED':'1'})
        self.messages=[{'role':'system','content':'Return JSON'},{'role':'user','content':[{'type':'text','text':'Read source'},{'type':'image_url','image_url':{'url':'data:image/png;base64,AA=='}}]}]
        self.payload={'id':'resp_unit','model':'gpt-6.1-sol','status':'completed','output':[{'type':'reasoning','summary':[]},{'type':'message','content':[{'type':'output_text','text':'{"ok":true}'}]}],'usage':{'input_tokens':100,'output_tokens':20,'total_tokens':120,'output_tokens_details':{'reasoning_tokens':10}}}

    def complete(self,payload=None):
        response=MagicMock()
        response.__enter__.return_value=response
        response.read.return_value=json.dumps(self.payload if payload is None else payload).encode()
        response.headers={'x-request-id':'req_unit'}
        with patch('server.provider.urllib.request.build_opener') as opener:
            opener.return_value.open.return_value=response
            result=self.p.complete(self.messages)
            req=opener.return_value.open.call_args.args[0]
        return result,req

    def test_requests_max_high_images_private_header_and_no_sampling(self):
        result,req=self.complete()
        body=json.loads(req.data)
        self.assertEqual(req.full_url,'https://api.bananarouter.com/v1/responses')
        self.assertEqual(req.get_header('Authorization'),'Bearer private-test-secret')
        self.assertNotIn('private-test-secret',req.data.decode())
        self.assertEqual(body['reasoning'],{'effort':'max'})
        self.assertEqual(body['max_output_tokens'],65536)
        self.assertFalse(body['store'])
        self.assertTrue(body['stream'])
        self.assertNotIn('temperature',body)
        self.assertNotIn('top_p',body)
        self.assertEqual(body['input'][0]['role'],'developer')
        self.assertEqual(body['input'][1]['content'][1]['detail'],'high')
        self.assertEqual(result['usage']['total_tokens'],120)
        self.assertEqual(result['responseModel'],'gpt-6.1-sol')
        self.assertEqual(result['requestId'],'req_unit')

    def test_incomplete_output_does_not_parse_partial_scene(self):
        value=copy.deepcopy(self.payload);value['status']='incomplete';value['incomplete_details']={'reason':'max_output_tokens'}
        with self.assertRaises(ProviderError) as ctx:self.complete(value)
        self.assertEqual(ctx.exception.code,'provider_response_incomplete')
        self.assertEqual(ctx.exception.usage['total_tokens'],120)

    def test_different_model_cannot_be_saved_as_requested_model(self):
        value=copy.deepcopy(self.payload);value['model']='some-other-model'
        with self.assertRaises(ProviderError) as ctx:self.complete(value)
        self.assertEqual(ctx.exception.code,'provider_model_mismatch')

    def test_json_conflicts_are_not_sliced(self):
        value=copy.deepcopy(self.payload);value['output'][1]['content'][0]['text']='{"a":1}{"a":2}'
        with self.assertRaises(ProviderError):self.complete(value)

    def test_unexpected_tool_cannot_execute(self):
        value=copy.deepcopy(self.payload);value['output'].append({'type':'function_call','name':'shell','arguments':'{}'})
        with self.assertRaises(ProviderError) as ctx:self.complete(value)
        self.assertEqual(ctx.exception.code,'provider_unexpected_tool')

    def test_refusal_is_not_a_json_result(self):
        value=copy.deepcopy(self.payload);value['output'][1]['content']=[{'type':'refusal','refusal':'blocked'}]
        with self.assertRaises(ProviderError) as ctx:self.complete(value)
        self.assertEqual(ctx.exception.code,'provider_refused')

    def test_no_key_or_legacy_key_does_not_activate_api(self):
        for config in ({},{'AI_LAB_API_KEY':'legacy-only'}):
            self.assertIsInstance(create_default_provider(config),CodexHandoffProvider)
            self.assertFalse(BananaRouterProvider(config).configured)

    def test_invalid_base_url_and_reasoning_fail_before_network(self):
        for extra in ({'AI_LAB_API_BASE_URL':'http://wrong.test/v1'},{'AI_LAB_API_REASONING_EFFORT':'ultra'},{'AI_LAB_API_TIMEOUT':'nan'},{'AI_LAB_API_MAX_OUTPUT_TOKENS':'-1'}):
            p=BananaRouterProvider({'AI_LAB_BANANAROUTER_KEY':'test',**extra})
            with self.assertRaises(ProviderError) as ctx:p.complete(self.messages)
            self.assertEqual(ctx.exception.code,'provider_config_invalid')

    def test_http_failure_never_exposes_body_or_retries(self):
        with patch('server.provider.urllib.request.build_opener') as opener:
            opener.return_value.open.side_effect=urllib.error.HTTPError('https://api.bananarouter.com/v1/responses',401,'private-test-secret',{},None)
            with self.assertRaises(ProviderError) as ctx:self.p.complete(self.messages)
            self.assertEqual(opener.return_value.open.call_count,1)
            self.assertNotIn('private-test-secret',str(ctx.exception))
            self.assertEqual(ctx.exception.code,'provider_auth_failed')

    def test_model_missing_does_not_claim_verified_identity(self):
        value=copy.deepcopy(self.payload);value.pop('model')
        with self.assertRaises(ProviderError):self.complete(value)


if __name__=='__main__':unittest.main()
