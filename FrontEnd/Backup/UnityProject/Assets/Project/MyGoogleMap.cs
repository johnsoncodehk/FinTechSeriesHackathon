using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class MyGoogleMap : MonoBehaviour
{
	public enum MapType
	{
		RoadMap,
		Satellite,
		Terrain,
		Hybrid
	}
	public bool loadOnStart = true;
	public bool autoLocateCenter = true;
	public int zoom;
	public MapType mapType;
	public int size = 512;
	public bool doubleResolution = false;
	public GoogleMapMarker[] markers;
	public GoogleMapPath[] paths;
	public float p = 1;

	private SpriteRenderer spriteRenderer;

	void Awake () {
		this.spriteRenderer = this.GetComponent<SpriteRenderer> ();
	}
	void Start() {
		if(loadOnStart) Refresh();
	}
	void OnEnable () {
		this.Refresh ();
	}

	public void Refresh() {
		print ("Refresh");
		if(autoLocateCenter && (markers.Length == 0 && paths.Length == 0)) {
			Debug.LogError("Auto Center will only work if paths or markers are used.");
		}
		StartCoroutine(_Refresh());
	}

	IEnumerator _Refresh ()
	{
		var url = "http://maps.googleapis.com/maps/api/staticmap";
		var qs = "";
		if (!autoLocateCenter) {
			Vector2 location = this.transform.position;

			// Vector2 location = this.transform.parent.position;
			// print ((this.transform.localPosition.x > 0 ? 1 : -1) * Mathf.Pow (0.5f, this.zoom) / 2);
			// location.x += (this.transform.localPosition.x > 0 ? 1 : -1) * Mathf.Pow (0.5f, this.zoom) / 2;
			// location.y += (this.transform.localPosition.y > 0 ? 1 : -1) * Mathf.Pow (0.5f, this.zoom) / 2;

			location *= Mathf.Pow (0.5f, zoom);
			location.x *= 1440;
			location.y *= this.p;
			qs += "center=" + WWW.UnEscapeURL (string.Format ("{0},{1}", location.y, location.x));

			qs += "&zoom=" + zoom.ToString ();
		}
		qs += "&size=" + WWW.UnEscapeURL (string.Format ("{0}x{0}", size));
		qs += "&scale=" + (doubleResolution ? "2" : "1");
		qs += "&maptype=" + mapType.ToString ().ToLower ();
		var usingSensor = false;
#if UNITY_IPHONE
		usingSensor = Input.location.isEnabledByUser && Input.location.status == LocationServiceStatus.Running;
#endif
		qs += "&sensor=" + (usingSensor ? "true" : "false");

		foreach (var i in markers) {
			qs += "&markers=" + string.Format ("size:{0}|color:{1}|label:{2}", i.size.ToString ().ToLower (), i.color, i.label);
			foreach (var loc in i.locations) {
				if (loc.address != "")
					qs += "|" + WWW.UnEscapeURL (loc.address);
				else
					qs += "|" + WWW.UnEscapeURL (string.Format ("{0},{1}", loc.latitude, loc.longitude));
			}
		}

		foreach (var i in paths) {
			qs += "&path=" + string.Format ("weight:{0}|color:{1}", i.weight, i.color);
			if(i.fill) qs += "|fillcolor:" + i.fillColor;
			foreach (var loc in i.locations) {
				if (loc.address != "")
					qs += "|" + WWW.UnEscapeURL (loc.address);
				else
					qs += "|" + WWW.UnEscapeURL (string.Format ("{0},{1}", loc.latitude, loc.longitude));
			}
		}


		print (qs);
		var req = new WWW (url + "?" + qs);
		yield return req;

		var tex = req.texture;
		Rect rec = new Rect(0, 0, tex.width, tex.height);
		if (string.IsNullOrEmpty (req.error)) {
			GetComponent<SpriteRenderer> ().sprite = Sprite.Create(tex,rec,new Vector2(0.5f,0.5f),512);
		}
	}

	public bool createSubs = false;
	void Update () {
		if (this.createSubs) {
			this.createSubs = false;
			this.ShowSubs ();
		}
	}
	public void ShowSubs () {
		if (this.transform.childCount > 0) {
			return;
		}
		var newMap = Instantiate (this);
		newMap.gameObject.SetActive (false);
		newMap.transform.SetParent (this.transform, false);
		// this.CreateSub (0f, 0f, newMap);
		this.CreateSub (-.5f, 0f, newMap);
		this.CreateSub (.5f, 0f, newMap);
		Destroy (newMap.gameObject);
		this.spriteRenderer.enabled = false;
		this.transform.localScale /= 2f;
	}
	private void CreateSub (float x, float y, MyGoogleMap map) {
		var newMap = Instantiate (map);
		newMap.transform.SetParent (this.transform, false);
		newMap.transform.localPosition = new Vector3 (x, y, 0);
		newMap.zoom = this.zoom + 1;
		newMap.gameObject.SetActive (true);
	}
}