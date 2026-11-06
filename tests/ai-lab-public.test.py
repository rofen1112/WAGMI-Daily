import base64
import http.client
import json
import sys
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'ai-lab'))
from server.public import PublicHandler, VisitorLabs, Admissions
from server.provider import BananaRouterProvider
from server.store import LabError


class PublicDeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='.tmp-public-lab-', dir=ROOT)
        self.root = Path(self.temp.name)
        self.secret = 'public-proxy-test-' + 'a' * 64
        self.factory = lambda: BananaRouterProvider({'AI_LAB_BANANAROUTER_KEY': 'offline-unit-test', 'AI_LAB_API_IMAGE_VERIFIED': '1'})
        self.visitors = VisitorLabs(self.root, self.secret, provider_factory=self.factory, start_worker=False)
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), PublicHandler)
        self.server.daemon_threads = True
        self.server.visitors = self.visitors
        self.server.allowed_origins = set()
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.visitors.close()
        self.temp.cleanup()

    def request(self, path='/health', *, cookie=None, body=None, proxy=True, secure=False):
        connection = http.client.HTTPConnection('127.0.0.1', self.server.server_port)
        headers = {'Content-Type': 'application/json'}
        if proxy: headers['X-Ark-Lab-Proxy'] = self.secret
        if secure: headers['X-Ark-Lab-Secure'] = '1'
        if cookie: headers['Cookie'] = cookie
        connection.request('GET' if body is None else 'POST', '/api/ai-lab/v1' + path, body=None if body is None else json.dumps(body), headers=headers)
        response = connection.getresponse()
        result = response.status, json.loads(response.read()), response.getheader('Set-Cookie')
        connection.close()
        return result

    def session(self):
        status, health, cookie = self.request(secure=True)
        self.assertEqual(status, 200)
        self.assertTrue(health['publicDeployment'])
        self.assertEqual(health['executionMode'], 'api')
        self.assertEqual(set(health['executionModes']), {'api'})
        self.assertIn('HttpOnly', cookie)
        self.assertIn('Secure', cookie)
        self.assertIn('SameSite=Lax', cookie)
        return cookie.split(';')[0]

    def test_browser_projects_assets_and_jobs_are_isolated_and_restart_persists(self):
        one, two = self.session(), self.session()
        project = self.request('/projects', cookie=one, body={'title': 'Private visitor project'})[1]['project']['id']
        image = 'data:image/png;base64,' + base64.b64encode(b'\x89PNG\r\n\x1a\n' + b'\x00' * 8 + b'\x00\x00\x00\x20' * 2).decode()
        uploaded = self.request('/assets', cookie=one, body={'name': 'plan.png', 'dataUrl': image})
        self.assertEqual(uploaded[0], 201)
        asset = uploaded[1]['asset']['id']
        status, created, _ = self.request(f'/projects/{project}/jobs', cookie=one, body={'assetId': asset, 'executionMode': 'api', 'scaleMode': 'manual', 'mmPerPixel': 10, 'idempotencyKey': 'same-request'})
        self.assertEqual(status, 202)
        job = created['job']['id']
        retry = self.request(f'/projects/{project}/jobs', cookie=one, body={'assetId': asset, 'executionMode': 'api', 'scaleMode': 'manual', 'mmPerPixel': 10, 'idempotencyKey': 'same-request'})
        self.assertEqual(retry[1]['job']['id'], job)
        self.assertEqual(self.request('/projects', cookie=two)[1]['projects'], [])
        for path in [f'/assets/{asset}', f'/jobs/{job}', f'/projects/{project}/scene', f'/projects/{project}/export']:
            self.assertEqual(self.request(path, cookie=two)[0], 404, path)
        self.assertEqual(self.request(f'/jobs/{job}/cancel', cookie=two, body={})[0], 404)
        self.assertEqual(self.request(f'/projects/{project}/state', cookie=two, body={})[0], 404)
        self.assertEqual(self.request('/baselines', cookie=one)[1], {'baselines': []})
        self.visitors.close()
        restored = VisitorLabs(self.root, self.secret, provider_factory=self.factory, start_worker=False)
        self.visitors = self.server.visitors = restored
        self.assertEqual(self.request('/projects', cookie=one)[1]['projects'][0]['id'], project)
        self.assertFalse((self.root / '.local-ai-lab').exists())

    def test_proxy_gate_operator_gate_cookie_tampering_and_api_only(self):
        self.assertEqual(self.request(proxy=False)[0], 403)
        one = self.session()
        project = self.request('/projects', cookie=one, body={})[1]['project']['id']
        self.assertEqual(self.request(f'/projects/{project}/jobs', cookie=one, body={'executionMode': 'codex_handoff'})[0], 403)
        self.assertEqual(self.request('/jobs/' + 'a' * 32 + '/handoff/request', cookie=one)[0], 404)
        tampered = one[:-1] + ('0' if one[-1] != '0' else '1')
        self.assertEqual(self.request('/projects', cookie=tampered)[1]['projects'], [])
        self.assertEqual(self.request(f'/projects/{project}/baseline', cookie=one, body={})[0], 404)

    def test_admission_limits_survive_restart_and_failed_inputs_release(self):
        one = self.session()
        visitor = self.visitors.identify(one)[0]
        lab = self.visitors.get(visitor)
        project = lab.create_project({})['project']['id']
        with self.assertRaises(LabError): lab.create_job(project, {'assetId': 'missing', 'executionMode': 'api'})
        admissions = Admissions(self.root / '.local-ai-lab-public', daily_total=2, daily_visitor=1)
        admissions.reserve(visitor)
        with self.assertRaises(LabError): admissions.reserve(visitor)
        admissions.reserve('another')
        reopened = Admissions(self.root / '.local-ai-lab-public', daily_total=2, daily_visitor=1)
        with self.assertRaises(LabError): reopened.reserve('third')


if __name__ == '__main__': unittest.main()
