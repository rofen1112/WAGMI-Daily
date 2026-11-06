"""Parameterized geometry must preserve dimensions, orientation and explicit data."""
from copy import deepcopy
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'ai-lab'))
from engine.primitives import expand_primitives
from engine.geometry import signed_area
from engine.scene import compile_pixel_scene


class PrimitivesTests(unittest.TestCase):
    def test_reversed_and_diagonal_walls_have_explicit_thickness(self):
        raw={'wallSegments':[{'id':'a','start':[90,20],'end':[10,20],'thickness':6,'kind':'e'},
                             {'id':'b','start':[20,20],'end':[50,60],'thickness':4,'height':2700}]}
        unchanged=deepcopy(raw)
        scene=expand_primitives(raw)
        self.assertEqual(raw, unchanged)
        self.assertEqual(scene['walls'], [[10,17,90,23,'e']])
        self.assertAlmostEqual(abs(signed_area(scene['polygonWalls'][0]['poly'])), 50*4)
        self.assertEqual(scene['polygonWalls'][0]['height'],2700)
        self.assertNotIn('wallSegments',scene)

    def test_repeat_office_furniture_stairs_and_compile_once(self):
        raw={'rooms':[{'id':'r1','name':'Office','mat':'carpet','poly':[[1,1],[199,1],[199,199],[1,199]]}],
             'furnitureRows':[{'idPrefix':'east','type':'desk','start':[25,25],'delta':[25,0],'count':6,'w':15,'d':8}],
             'stairRuns':[{'idPrefix':'stairs','start':[25,100],'direction':[1,0],'count':12,'tread':4,'width':20,'riserMm':160}]}
        scene,check=compile_pixel_scene(raw,200,200,20,'test-case')
        self.assertFalse(check['errors'],check)
        self.assertEqual(len(scene['furniture']),6)
        self.assertEqual(len(scene['steps']),12)
        self.assertEqual(scene['furniture'][-1]['cx'],150*20)
        self.assertEqual(scene['furniture'][0]['w'],15*20)
        self.assertAlmostEqual(abs(signed_area(scene['steps'][0]['poly'])),4*20*20**2)
        self.assertEqual(scene['steps'][-1]['height'],12*160)

    def test_legacy_unchanged_and_expansion_idempotent(self):
        raw={'walls':[[1,1,2,9,'i']], 'furniture':[{'id':'f1','type':'desk'}]}
        self.assertEqual(expand_primitives(raw), raw)
        new=expand_primitives({'furnitureRows':[{'idPrefix':'row','type':'chair','start':[10,10],'delta':[5,0],'count':3,'w':2,'d':2}]})
        self.assertEqual(expand_primitives(new),new)

    def test_no_guessed_width_or_direction_and_no_unbounded_expansion(self):
        cases=[{'wallSegments':[{'start':[1,2],'end':[1,2],'thickness':3}]},
               {'wallSegments':[{'start':[1,2],'end':[3,2],'thickness':0}]},
               {'wallSegments':[{'start':[1,2],'end':[3,2]}]},
               {'furnitureRows':[{'idPrefix':'f','type':'desk','start':[1,1],'delta':[1,0],'count':True,'w':1,'d':1}]},
               {'furnitureRows':[{'idPrefix':'f','type':'desk','start':[1,1],'delta':[1,0],'count':3001,'w':1,'d':1}]},
               {'furnitureRows':[{'idPrefix':'f','type':'desk','start':[1,1],'delta':[math.inf,0],'count':1,'w':1,'d':1}]},
               {'stairRuns':[{'idPrefix':'s','start':[1,1],'direction':[1,1],'count':2,'tread':2,'width':4,'riserMm':150}]}]
        for candidate in cases:
            with self.subTest(candidate=candidate), self.assertRaises(ValueError):
                expand_primitives(candidate)

    def test_expanded_bounds_still_rejected_not_clamped(self):
        raw={'rooms':[{'id':'r1','name':'Room','mat':'wood','poly':[[1,1],[90,1],[90,90],[1,90]]}],
             'wallSegments':[{'start':[0,0],'end':[90,0],'thickness':4}]}
        _,check=compile_pixel_scene(raw,100,100,10,'test-case')
        self.assertTrue(any(e['code']=='out_of_bounds' for e in check['errors']),check)


if __name__=='__main__':unittest.main()
