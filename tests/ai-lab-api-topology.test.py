import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'ai-lab'))
from server.geometry_audit import audit_pixel_topology


class ApertureTests(unittest.TestCase):
    def test_full_window_occlusion_blocks(self):
        r=audit_pixel_topology({'walls':[[970,111,987,266,'e']],'windows':[[970,111,987,266]]})
        self.assertEqual(r['errors'][0]['code'],'aperture_blocked_by_wall')

    def test_split_walls_leave_window(self):
        r=audit_pixel_topology({'walls':[[0,0,10,30,'e'],[0,70,10,100,'e']],'windows':[[0,30,10,70]]})
        self.assertEqual(r,{'errors':[],'warnings':[]})

    def test_union_does_not_double_count_junction(self):
        r=audit_pixel_topology({'walls':[[0,0,10,30,'i'],[0,0,10,30,'i']],'doors':[{'rect':[0,0,10,100]}]})
        self.assertFalse(r['errors'])
        self.assertEqual(len(r['warnings']),1)

    def test_multiple_walls_fully_occlude(self):
        r=audit_pixel_topology({'walls':[[0,0,10,50,'e'],[0,50,10,100,'e']],'slides':[{'rect':[0,0,10,100]}]})
        self.assertEqual(len(r['errors']),1)

    def test_small_door_junction_is_not_a_blocker(self):
        r=audit_pixel_topology({'walls':[[747,335,903,351,'i']],'doors':[{'rect':[749,344,761,420]}]})
        self.assertFalse(r['errors'])

    def test_invalid_geometry_is_left_to_schema_validator(self):
        r=audit_pixel_topology({'walls':[[0,0,float('nan'),10]],'windows':[[0,0,0,10],None]})
        self.assertFalse(r['errors'])


if __name__=='__main__':unittest.main()
