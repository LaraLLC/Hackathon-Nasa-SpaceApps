"""Marca apps/api como rootdir de import para o pytest.

Com este arquivo, `pytest -q apps/api/tests` funciona a partir da raiz do repositório
(o pytest insere apps/api no sys.path, então `import simulation` resolve).
"""
